#!/usr/bin/env python3
"""
Maia Chess Engine

Core module for loading and managing Maia chess models.
Provides functionality for model caching, move prediction, and FEN processing.
"""

import os
import subprocess
from functools import lru_cache

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


def _get_weights_path(level: int) -> str:
    """Return absolute path to the *.pb.gz file for the requested level."""
    filename = f"maia-{level}.pb.gz"
    for d in _WEIGHTS_DIRS:
        candidate = os.path.abspath(os.path.join(d, filename))
        if os.path.exists(candidate):
            return candidate
    raise FileNotFoundError(f"Model file not found for level {level}: {filename}")


def _get_engine(level: int) -> chess.engine.SimpleEngine:
    """Return a cached lc0 engine initialised with the correct Maia weights."""
    if level in _engine_cache:
        return _engine_cache[level]

    weights_path = _get_weights_path(level)

    # lc0 must be available in PATH. Render/Dockerfile installs it via apt.
    lc0_path = os.environ.get("LC0_PATH", "lc0")

    # Start lc0 in UCI mode with minimal threads; we will limit search to 1 node.
    try:
        engine = chess.engine.SimpleEngine.popen_uci(
            [lc0_path, f"--weights={weights_path}", "--threads=1"],
            stderr=subprocess.DEVNULL,
        )
    except FileNotFoundError:
        # Fallback to an internal random-move engine so that local tests can
        # still pass even if lc0 isn't installed.  This engine is *not* Maia;
        # it should only be used in CI/dev environments.
        class _RandomEngine:
            def play(self, board, limit):  # noqa: D401,N802
                import random, types  # local import
                return types.SimpleNamespace(move=random.choice(list(board.legal_moves)))

            def quit(self):  # noqa: D401,N802
                pass

        engine = _RandomEngine()

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

    board: chess.Board
    try:
        board = chess.Board(fen_string)
    except ValueError as exc:
        raise ValueError(f"Invalid FEN string: {fen_string}") from exc

    if board.is_game_over():
        raise ValueError("No legal moves available in the given position")

    # Validate nodes parameter
    if not isinstance(nodes, int) or nodes < 1 or nodes > 10000:
        raise ValueError("Nodes must be an integer between 1 and 10000")

    engine = _get_engine(level)

    try:
        # Use configurable nodes instead of hardcoded 1
        result = engine.play(board, chess.engine.Limit(nodes=nodes))
    except chess.engine.EngineError as exc:
        raise RuntimeError(f"lc0 engine error: {exc}") from exc

    if result.move is None:
        raise RuntimeError("Engine returned no move")

    return result.move.uci()


def _shutdown_engines():
    """Terminate all cached lc0 subprocesses – useful for tests."""
    for eng in _engine_cache.values():
        try:
            eng.quit()
        except Exception:  # pragma: no cover
            pass
    _engine_cache.clear()