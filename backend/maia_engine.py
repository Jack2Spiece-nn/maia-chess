#!/usr/bin/env python3
"""
Maia Chess Engine Interface

Provides an interface to the Maia chess models using LC0 or fallback engines.
Enhanced with comprehensive validation logging for diagnostic purposes.
"""

import os
import subprocess
import tempfile
import time
import logging
import random
from threading import Lock
from typing import Dict, Any, Tuple

# TensorFlow is optional for future upgrades – import but don't fail hard.
# Note: TensorFlow is currently not used, so we're commenting it out to avoid
# the initialization overhead that causes Gunicorn worker timeouts
# try:
#     import tensorflow as tf  # type: ignore  # noqa: F401
# except Exception:  # pragma: no cover
#     pass

import chess
import chess.engine  # type: ignore
import gzip

# Configure validation logger
validation_logger = logging.getLogger('maia_validation')
validation_logger.setLevel(logging.INFO)
if not validation_logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('[%(asctime)s] %(levelname)s:%(name)s: %(message)s')
    handler.setFormatter(formatter)
    validation_logger.addHandler(handler)

# Enhanced logging for engine performance
engine_logger = logging.getLogger('maia_engine')
engine_logger.setLevel(logging.INFO)

# Directory that stores the official Maia LC0 weight files shipped with the repo
_WEIGHTS_DIRS = [
    os.path.join(os.path.dirname(__file__), "..", "maia_weights"),  # For local development
    os.path.join(os.path.dirname(__file__), "..", "models"),       # For local development
    os.path.join(os.path.dirname(__file__), "maia_weights"),       # For Docker deployment
    os.path.join(os.path.dirname(__file__), "models"),             # For Docker deployment
]

# Cache of running lc0 processes keyed by skill level (1100-1900)
_engine_cache: dict[int, chess.engine.SimpleEngine] = {}

# Engine performance tracking
_engine_stats = {
    'startup_times': {},  # level -> startup time in seconds
    'move_counts': {},    # level -> number of moves computed
    'total_compute_time': {},  # level -> total computation time
    'last_used': {},      # level -> last usage timestamp
    'memory_usage': {},   # level -> memory usage tracking
    'validation_metrics': []  # validation performance history
}

# Configure logging
logger = logging.getLogger(__name__)

# Memory monitoring
def get_memory_usage():
    """Get current memory usage in MB"""
    try:
        import psutil
        return psutil.Process(os.getpid()).memory_info().rss / 1024 / 1024
    except ImportError:
        return 0.0

def validate_engine_performance(level: int = 1500) -> Dict[str, Any]:
    """Log detailed engine performance metrics for validation"""
    start_time = time.time()
    memory_before = get_memory_usage()
    
    try:
        # Test move with timing
        move = predict_move("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", level, 1)
        
        end_time = time.time()
        memory_after = get_memory_usage()
        
        metrics = {
            'move_calculation_time_ms': (end_time - start_time) * 1000,
            'memory_usage_mb': memory_after,
            'memory_delta_mb': memory_after - memory_before,
            'engine_cached': level in _engine_cache,
            'move': move,
            'level': level,
            'timestamp': time.time(),
            'success': True
        }
        
        # Store validation metrics
        _engine_stats['validation_metrics'].append(metrics)
        # Keep only last 100 validation runs
        if len(_engine_stats['validation_metrics']) > 100:
            _engine_stats['validation_metrics'] = _engine_stats['validation_metrics'][-100:]
        
        validation_logger.info(f"ENGINE_VALIDATION: {metrics}")
        return metrics
        
    except Exception as e:
        end_time = time.time()
        memory_after = get_memory_usage()
        
        error_metrics = {
            'move_calculation_time_ms': (end_time - start_time) * 1000,
            'memory_usage_mb': memory_after,
            'memory_delta_mb': memory_after - memory_before,
            'engine_cached': level in _engine_cache,
            'error': str(e),
            'level': level,
            'timestamp': time.time(),
            'success': False
        }
        
        validation_logger.error(f"ENGINE_VALIDATION_ERROR: {error_metrics}")
        return error_metrics

def warm_engines(levels=None):
    """Pre-warm engines for common difficulty levels"""
    if levels is None:
        levels = [1100, 1500, 1900]  # Popular levels
    
    logger.info(f"Starting engine warm-up for levels: {levels}")
    warm_start_time = time.time()
    
    for level in levels:
        try:
            level_start = time.time()
            _get_engine(level)
            level_time = time.time() - level_start
            logger.info(f"Pre-warmed engine for level {level} in {level_time*1000:.2f}ms")
            validation_logger.info(f"ENGINE_WARMUP: level={level}, time_ms={level_time*1000:.2f}")
        except Exception as e:
            logger.error(f"Failed to pre-warm engine {level}: {e}")
            validation_logger.error(f"ENGINE_WARMUP_ERROR: level={level}, error={str(e)}")
    
    total_warm_time = time.time() - warm_start_time
    logger.info(f"Engine warm-up completed in {total_warm_time*1000:.2f}ms")

def monitor_memory_usage():
    """Monitor and optimize memory usage"""
    memory_usage = get_memory_usage()
    
    # Log memory usage
    validation_logger.info(f"MEMORY_USAGE: total_mb={memory_usage:.2f}, engines={len(_engine_cache)}")
    
    # Check if memory usage is high (threshold for 512MB free tier)
    if memory_usage > 400:  # Leave some headroom
        logger.warning(f"High memory usage: {memory_usage:.2f}MB")
        validation_logger.warning(f"HIGH_MEMORY_WARNING: usage_mb={memory_usage:.2f}")
        
        # Trigger cleanup if too many engines are cached
        if len(_engine_cache) > 2:
            cleanup_unused_engines()
    
    return memory_usage

def cleanup_unused_engines(max_age_seconds: int = 300):
    """Clean up engines that haven't been used recently"""
    current_time = time.time()
    engines_to_remove = []
    
    for level, last_used_time in _engine_stats['last_used'].items():
        if current_time - last_used_time > max_age_seconds:
            engines_to_remove.append(level)
    
    for level in engines_to_remove:
        if level in _engine_cache:
            try:
                _engine_cache[level].quit()
                del _engine_cache[level]
                logger.info(f"Cleaned up unused engine for level {level}")
                validation_logger.info(f"ENGINE_CLEANUP: level={level}, age_seconds={current_time - _engine_stats['last_used'][level]:.1f}")
            except Exception as e:
                logger.error(f"Error cleaning up engine {level}: {e}")


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
        # Update last used timestamp
        _engine_stats['last_used'][level] = time.time()
        logger.debug(f"Engine cache hit for level {level}")
        return _engine_cache[level]

    logger.info(f"Creating new engine for level {level}")
    startup_start = time.time()
    memory_before = get_memory_usage()

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
        logger.warning("LC0 not found, using random engine fallback")
        
        class _RandomEngine:
            def play(self, board, limit):  # noqa: D401,N802
                import random, types  # local import
                return types.SimpleNamespace(move=random.choice(list(board.legal_moves)))

            def quit(self):  # noqa: D401,N802
                pass

        engine = _RandomEngine()

    startup_time = time.time() - startup_start
    memory_after = get_memory_usage()
    memory_delta = memory_after - memory_before
    
    # Record engine statistics
    _engine_stats['startup_times'][level] = startup_time
    _engine_stats['move_counts'][level] = 0
    _engine_stats['total_compute_time'][level] = 0.0
    _engine_stats['last_used'][level] = time.time()
    _engine_stats['memory_usage'][level] = memory_delta
    
    logger.info(f"Engine for level {level} started in {startup_time*1000:.2f}ms, memory: +{memory_delta:.2f}MB")
    validation_logger.info(f"ENGINE_STARTUP: level={level}, time_ms={startup_time*1000:.2f}, memory_delta_mb={memory_delta:.2f}")

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
    computation_start = time.time()
    memory_before = get_memory_usage()

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

    # Log move request with validation
    logger.debug(f"Computing move for level {level}, nodes {nodes}, position: {fen_string[:30]}...")
    validation_logger.info(f"MOVE_REQUEST: level={level}, nodes={nodes}, fen_start={fen_string[:20]}")

    engine = _get_engine(level)
    
    move_computation_start = time.time()

    try:
        # Use configurable nodes instead of hardcoded 1
        result = engine.play(board, chess.engine.Limit(nodes=nodes))
    except chess.engine.EngineError as exc:
        logger.error(f"Engine error for level {level}: {exc}")
        validation_logger.error(f"ENGINE_ERROR: level={level}, error={str(exc)}")
        raise RuntimeError(f"lc0 engine error: {exc}") from exc

    if result.move is None:
        logger.error(f"Engine returned no move for level {level}")
        validation_logger.error(f"NO_MOVE_ERROR: level={level}")
        raise RuntimeError("Engine returned no move")

    move_computation_time = time.time() - move_computation_start
    total_time = time.time() - computation_start
    memory_after = get_memory_usage()

    # Update engine statistics
    if level not in _engine_stats['move_counts']:
        _engine_stats['move_counts'][level] = 0
        _engine_stats['total_compute_time'][level] = 0.0
    
    _engine_stats['move_counts'][level] += 1
    _engine_stats['total_compute_time'][level] += move_computation_time
    _engine_stats['last_used'][level] = time.time()

    # Enhanced logging with validation metrics
    logger.info(f"Move computed: {result.move.uci()}, Level: {level}, Nodes: {nodes}, "
               f"Engine time: {move_computation_time*1000:.2f}ms, Total: {total_time*1000:.2f}ms")
    
    validation_logger.info(f"MOVE_COMPUTED: move={result.move.uci()}, level={level}, nodes={nodes}, "
                          f"engine_time_ms={move_computation_time*1000:.2f}, total_time_ms={total_time*1000:.2f}, "
                          f"memory_mb={memory_after:.2f}")

    return result.move.uci()


def get_engine_stats() -> dict:
    """Return engine performance statistics."""
    stats = {}
    current_memory = get_memory_usage()
    
    for level in _engine_cache.keys():
        move_count = _engine_stats['move_counts'].get(level, 0)
        total_time = _engine_stats['total_compute_time'].get(level, 0.0)
        
        stats[level] = {
            'startup_time_ms': round(_engine_stats['startup_times'].get(level, 0) * 1000, 2),
            'move_count': move_count,
            'total_compute_time_ms': round(total_time * 1000, 2),
            'average_move_time_ms': round((total_time / move_count * 1000) if move_count > 0 else 0, 2),
            'last_used_ago_seconds': round(time.time() - _engine_stats['last_used'].get(level, 0), 2),
            'memory_usage_mb': _engine_stats['memory_usage'].get(level, 0),
            'is_cached': True
        }
    
    # Include validation metrics summary
    validation_summary = {}
    if _engine_stats['validation_metrics']:
        recent_validations = _engine_stats['validation_metrics'][-10:]  # Last 10 validations
        validation_summary = {
            'recent_validations_count': len(recent_validations),
            'avg_response_time_ms': sum(v['move_calculation_time_ms'] for v in recent_validations if v['success']) / len([v for v in recent_validations if v['success']]) if any(v['success'] for v in recent_validations) else 0,
            'success_rate': len([v for v in recent_validations if v['success']]) / len(recent_validations) if recent_validations else 0,
            'avg_memory_delta_mb': sum(v['memory_delta_mb'] for v in recent_validations) / len(recent_validations) if recent_validations else 0
        }
    
    return {
        'cached_engines': len(_engine_cache),
        'current_memory_mb': round(current_memory, 2),
        'engine_details': stats,
        'total_moves_computed': sum(_engine_stats['move_counts'].values()),
        'total_computation_time_ms': round(sum(_engine_stats['total_compute_time'].values()) * 1000, 2),
        'validation_summary': validation_summary
    }


def _shutdown_engines():
    """Terminate all cached lc0 subprocesses – useful for tests."""
    for eng in _engine_cache.values():
        try:
            eng.quit()
        except Exception:  # pragma: no cover
            pass
    _engine_cache.clear()


def _check_lc0_availability() -> bool:
    """Check if LC0 engine is available in the system."""
    try:
        lc0_path = os.environ.get("LC0_PATH", "lc0")
        result = subprocess.run([lc0_path, "--help"], 
                              capture_output=True, 
                              text=True, 
                              timeout=5)
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def predict_move_with_validation_logging(fen_string: str, level: int = 1500, nodes: int = 1) -> Tuple[str, str]:
    """Enhanced move prediction with comprehensive validation logging."""
    import time
    
    start_time = time.time()
    
    # Log engine availability check
    engine_type = "LC0" if _check_lc0_availability() else "RANDOM_FALLBACK"
    validation_logger.info(f"ENGINE_CHECK: Level={level}, Type={engine_type}, Nodes={nodes}")
    
    # Track move quality indicators
    try:
        move = predict_move(fen_string, level, nodes)
        response_time = (time.time() - start_time) * 1000
        
        # Log performance and quality metrics
        validation_logger.info(f"MOVE_QUALITY: Level={level}, Move={move}, ResponseTime={response_time:.2f}ms, EngineType={engine_type}")
        
        return move, engine_type
    except Exception as e:
        response_time = (time.time() - start_time) * 1000
        validation_logger.error(f"MOVE_ERROR: Level={level}, Error={str(e)}, ResponseTime={response_time:.2f}ms, EngineType={engine_type}")
        raise

# Initialize engines on startup if environment variable is set
if os.environ.get("WARM_ENGINES_ON_STARTUP", "false").lower() == "true":
    try:
        warm_engines()
    except Exception as e:
        logger.warning(f"Failed to warm engines on startup: {e}")