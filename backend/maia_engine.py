#!/usr/bin/env python3
"""
Maia Chess Engine

Core module for loading and managing Maia chess models.
Provides functionality for model caching, move prediction, and FEN processing.
"""

import os
import subprocess
import logging
from functools import lru_cache
from typing import Dict, Optional, Any

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# TensorFlow is optional for future upgrades – import but don't fail hard.
# Note: TensorFlow is currently not used, so we're commenting it out to avoid
# the initialization overhead that causes Gunicorn worker timeouts
# try:
#     import tensorflow as tf  # type: ignore  # noqa: F401
# except Exception:  # pragma: no cover
#     pass

import chess
import chess.engine  # type: ignore

# Directory that stores the official Maia LC0 weight files shipped with the repo
_WEIGHTS_DIRS = [
    os.path.join(os.path.dirname(__file__), "..", "maia_weights"),  # For local development
    os.path.join(os.path.dirname(__file__), "..", "models"),       # For local development
    os.path.join(os.path.dirname(__file__), "maia_weights"),       # For Docker deployment
    os.path.join(os.path.dirname(__file__), "models"),             # For Docker deployment
]

# Cache of running lc0 processes keyed by skill level (1100-1900)
_engine_cache: dict[int, chess.engine.SimpleEngine] = {}

# Track model loading status
_model_status: Dict[int, bool] = {}


def _validate_environment() -> Dict[str, Any]:
    """Validate the environment and return status information."""
    status = {
        'weights_dirs': [],
        'lc0_available': False,
        'lc0_path': None,
        'available_models': []
    }
    
    # Check weight directories
    for d in _WEIGHTS_DIRS:
        abs_path = os.path.abspath(d)
        exists = os.path.exists(abs_path)
        status['weights_dirs'].append({
            'path': abs_path,
            'exists': exists,
            'files': os.listdir(abs_path) if exists else []
        })
        logger.info(f"Weight directory {abs_path}: {'EXISTS' if exists else 'MISSING'}")
    
    # Check LC0 availability
    lc0_path = os.environ.get("LC0_PATH", "lc0")
    try:
        result = subprocess.run([lc0_path, "--help"], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            status['lc0_available'] = True
            status['lc0_path'] = lc0_path
            logger.info(f"LC0 engine available at: {lc0_path}")
        else:
            logger.warning(f"LC0 engine check failed with return code: {result.returncode}")
    except (FileNotFoundError, subprocess.TimeoutExpired) as e:
        logger.warning(f"LC0 engine not available: {e}")
    
    # Check available models
    for level in [1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900]:
        try:
            path = _get_weights_path(level)
            status['available_models'].append(level)
            logger.info(f"Model {level} available at: {path}")
        except FileNotFoundError:
            logger.warning(f"Model {level} not found")
    
    return status


def _get_weights_path(level: int) -> str:
    """Return absolute path to the *.pb.gz file for the requested level."""
    filename = f"maia-{level}.pb.gz"
    
    logger.debug(f"Searching for model file: {filename}")
    
    for d in _WEIGHTS_DIRS:
        candidate = os.path.abspath(os.path.join(d, filename))
        logger.debug(f"Checking: {candidate}")
        if os.path.exists(candidate):
            file_size = os.path.getsize(candidate)
            logger.info(f"Found model {level} at {candidate} (size: {file_size} bytes)")
            return candidate
    
    logger.error(f"Model file not found for level {level}: {filename}")
    logger.error(f"Searched directories: {[os.path.abspath(d) for d in _WEIGHTS_DIRS]}")
    raise FileNotFoundError(f"Model file not found for level {level}: {filename}")


def _get_engine(level: int) -> chess.engine.SimpleEngine:
    """Return a cached lc0 engine initialised with the correct Maia weights."""
    if level in _engine_cache:
        logger.debug(f"Using cached engine for level {level}")
        return _engine_cache[level]

    logger.info(f"Initializing new engine for level {level}")
    
    try:
        weights_path = _get_weights_path(level)
    except FileNotFoundError as e:
        logger.error(f"Cannot initialize engine for level {level}: {e}")
        _model_status[level] = False
        raise

    # lc0 must be available in PATH. Render/Dockerfile installs it via apt.
    lc0_path = os.environ.get("LC0_PATH", "lc0")

    # Start lc0 in UCI mode with minimal threads; we will limit search to 1 node.
    try:
        logger.info(f"Starting LC0 engine with weights: {weights_path}")
        engine = chess.engine.SimpleEngine.popen_uci(
            [lc0_path, f"--weights={weights_path}", "--threads=1"],
            stderr=subprocess.DEVNULL,
        )
        logger.info(f"Successfully initialized LC0 engine for level {level}")
        _model_status[level] = True
    except FileNotFoundError as e:
        logger.warning(f"LC0 not found, falling back to random engine: {e}")
        # Fallback to an internal random-move engine so that local tests can
        # still pass even if lc0 isn't installed.  This engine is *not* Maia;
        # it should only be used in CI/dev environments.
        class _RandomEngine:
            def play(self, board, limit):  # noqa: D401,N802
                import random, types  # local import
                logger.warning(f"Using random engine (NOT Maia) for level {level}")
                return types.SimpleNamespace(move=random.choice(list(board.legal_moves)))

            def quit(self):  # noqa: D401,N802
                pass

        engine = _RandomEngine()
        _model_status[level] = False
    except Exception as e:
        logger.error(f"Failed to initialize engine for level {level}: {e}")
        _model_status[level] = False
        raise

    _engine_cache[level] = engine
    return engine


def predict_move(fen_string: str, level: int = 1500, nodes: int = 1) -> str:  # noqa: D401
    """Return Maia's best move for *fen_string* at the given Elo *level*.

    The function spawns (or reuses) an lc0 engine loaded with the corresponding
    Maia network and asks for a configurable node search. Higher node counts
    will make Maia stronger but take longer to compute.
    
    Args:
        fen_string: FEN position string
        level: Elo level (1100-1900)
        nodes: Number of nodes to search (default 1, can be 1-10000)
    """
    logger.info(f"Predicting move for level {level}, nodes {nodes}")
    logger.debug(f"FEN: {fen_string}")

    board: chess.Board
    try:
        board = chess.Board(fen_string)
        logger.debug(f"Parsed board: {board.fen()}")
    except ValueError as exc:
        logger.error(f"Invalid FEN string: {fen_string}")
        raise ValueError(f"Invalid FEN string: {fen_string}") from exc

    if board.is_game_over():
        logger.warning(f"Game is over, no legal moves available")
        raise ValueError("No legal moves available in the given position")

    # Validate nodes parameter
    if not isinstance(nodes, int) or nodes < 1 or nodes > 10000:
        logger.error(f"Invalid nodes parameter: {nodes}")
        raise ValueError("Nodes must be an integer between 1 and 10000")

    # Validate level parameter
    if level not in [1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900]:
        logger.error(f"Invalid level parameter: {level}")
        raise ValueError(f"Level must be one of: 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900")

    try:
        engine = _get_engine(level)
        logger.debug(f"Got engine for level {level}")
    except Exception as e:
        logger.error(f"Failed to get engine for level {level}: {e}")
        raise

    try:
        # Use configurable nodes instead of hardcoded 1
        logger.debug(f"Requesting move with {nodes} nodes")
        result = engine.play(board, chess.engine.Limit(nodes=nodes))
        logger.debug(f"Engine returned result: {result}")
    except chess.engine.EngineError as exc:
        logger.error(f"LC0 engine error: {exc}")
        raise RuntimeError(f"lc0 engine error: {exc}") from exc
    except Exception as e:
        logger.error(f"Unexpected error during move calculation: {e}")
        raise

    if result.move is None:
        logger.error("Engine returned no move")
        raise RuntimeError("Engine returned no move")

    move_uci = result.move.uci()
    logger.info(f"Predicted move: {move_uci}")
    return move_uci


def get_engine_status() -> Dict[str, Any]:
    """Get status information about engines and models."""
    return {
        'environment': _validate_environment(),
        'cached_engines': list(_engine_cache.keys()),
        'model_status': _model_status.copy(),
        'weights_dirs': _WEIGHTS_DIRS
    }


def _shutdown_engines():
    """Terminate all cached lc0 subprocesses – useful for tests."""
    logger.info("Shutting down all engines")
    for level, eng in _engine_cache.items():
        try:
            logger.debug(f"Shutting down engine for level {level}")
            eng.quit()
        except Exception as e:  # pragma: no cover
            logger.warning(f"Error shutting down engine for level {level}: {e}")
    _engine_cache.clear()
    _model_status.clear()
    logger.info("All engines shut down")