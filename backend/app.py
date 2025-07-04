#!/usr/bin/env python3
"""
Maia Chess Backend API

A lightweight Flask application that serves as the API for the Maia chess engine.
"""

import time
import logging
from collections import defaultdict, deque
from threading import Lock
from flask import Flask, jsonify, request
from maia_engine import predict_move
from flask_cors import CORS

# Enable Cross-Origin Resource Sharing so that the React frontend
# served from a different domain/port can access this API without
# additional proxy configuration.
app = Flask(__name__)
CORS(app)  # allow all origins by default; restrict in production if needed

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Performance monitoring
performance_metrics = {
    'total_requests': 0,
    'total_response_time': 0.0,
    'recent_response_times': deque(maxlen=100),  # Keep last 100 response times
    'engine_cache_hits': defaultdict(int),
    'engine_cache_misses': defaultdict(int),
    'error_count': 0,
}
metrics_lock = Lock()

def update_metrics(response_time: float, level: int, cache_hit: bool = True, error: bool = False):
    """Update performance metrics in a thread-safe manner."""
    with metrics_lock:
        performance_metrics['total_requests'] += 1
        performance_metrics['total_response_time'] += response_time
        performance_metrics['recent_response_times'].append(response_time)
        
        if cache_hit:
            performance_metrics['engine_cache_hits'][level] += 1
        else:
            performance_metrics['engine_cache_misses'][level] += 1
            
        if error:
            performance_metrics['error_count'] += 1

def get_performance_summary():
    """Get a summary of performance metrics."""
    with metrics_lock:
        total_requests = performance_metrics['total_requests']
        recent_times = list(performance_metrics['recent_response_times'])
        
        return {
            'total_requests': total_requests,
            'average_response_time': (
                performance_metrics['total_response_time'] / total_requests 
                if total_requests > 0 else 0
            ),
            'recent_average': sum(recent_times) / len(recent_times) if recent_times else 0,
            'recent_min': min(recent_times) if recent_times else 0,
            'recent_max': max(recent_times) if recent_times else 0,
            'cache_hits': dict(performance_metrics['engine_cache_hits']),
            'cache_misses': dict(performance_metrics['engine_cache_misses']),
            'error_count': performance_metrics['error_count'],
            'cache_efficiency': {
                level: hits / (hits + performance_metrics['engine_cache_misses'][level])
                if (hits + performance_metrics['engine_cache_misses'][level]) > 0 else 0
                for level, hits in performance_metrics['engine_cache_hits'].items()
            }
        }


@app.route('/')
def health_check():
    """Health check endpoint to confirm the server is running."""
    perf_summary = get_performance_summary()
    return jsonify({
        'status': 'ok',
        'message': 'Maia Chess Backend is running',
        'version': '1.0.0',
        'performance': {
            'total_requests': perf_summary['total_requests'],
            'average_response_time_ms': round(perf_summary['average_response_time'] * 1000, 2),
            'recent_average_ms': round(perf_summary['recent_average'] * 1000, 2),
            'error_rate': (
                perf_summary['error_count'] / perf_summary['total_requests'] 
                if perf_summary['total_requests'] > 0 else 0
            ),
        }
    })


@app.route('/metrics')
def get_metrics():
    """Detailed performance metrics endpoint."""
    from maia_engine import get_engine_stats
    
    api_metrics = get_performance_summary()
    engine_metrics = get_engine_stats()
    
    return jsonify({
        'api_performance': api_metrics,
        'engine_performance': engine_metrics,
        'timestamp': time.time()
    })


@app.route('/get_move', methods=['POST'])
def get_move():
    """
    Get the best move for a given chess position.
    
    Expected JSON payload:
    {
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        "level": 1500,  # optional, defaults to 1500
        "nodes": 1      # optional, defaults to 1, can be 1-10000
    }
    
    Returns:
    {
        "move": "e2e4",
        "level": 1500,
        "nodes": 1,
        "response_time_ms": 1234.5,
        "engine_cached": true
    }
    """
    start_time = time.time()
    request_level = None
    error_occurred = False
    
    try:
        # Check if request has JSON content type
        if not request.is_json:
            error_occurred = True
            return jsonify({'error': 'Request must contain JSON data'}), 400
        
        # Get JSON data from request
        data = request.get_json()
        if not data:
            error_occurred = True
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract FEN string
        fen = data.get('fen')
        if not fen:
            error_occurred = True
            return jsonify({'error': 'FEN string is required'}), 400
        
        # Extract level (optional, defaults to 1500)
        level = data.get('level', 1500)
        
        # Validate level is an integer
        try:
            level = int(level)
            request_level = level
        except (ValueError, TypeError):
            error_occurred = True
            return jsonify({'error': 'Level must be an integer'}), 400
        
        # Extract nodes (optional, defaults to 1)
        nodes = data.get('nodes', 1)
        
        # Validate nodes is an integer
        try:
            nodes = int(nodes)
        except (ValueError, TypeError):
            error_occurred = True
            return jsonify({'error': 'Nodes must be an integer'}), 400
        
        # Log the request
        logger.info(f"Move request: FEN={fen[:20]}..., Level={level}, Nodes={nodes}")
        
        # Get the predicted move with performance tracking and validation logging
        move_start_time = time.time()
        move, engine_was_cached = predict_move_with_metrics(fen, level, nodes)
        move_time = time.time() - move_start_time
        
        # Additional validation logging
        try:
            from maia_engine import predict_move_with_validation_logging
            _, engine_type = predict_move_with_validation_logging(fen, level, nodes)
        except ImportError:
            engine_type = "UNKNOWN"
        
        response_time = time.time() - start_time
        
        # Update metrics
        update_metrics(response_time, level, cache_hit=engine_was_cached, error=False)
        
        logger.info(f"Move completed: {move}, Engine cached: {engine_was_cached}, Time: {response_time*1000:.2f}ms")
        
        return jsonify({
            'move': move,
            'level': level,
            'nodes': nodes,
            'response_time_ms': round(response_time * 1000, 2),
            'engine_cached': engine_was_cached,
            'computation_time_ms': round(move_time * 1000, 2),
            'engine_type': engine_type  # For validation purposes
        })
        
    except FileNotFoundError as e:
        error_occurred = True
        response_time = time.time() - start_time
        if request_level:
            update_metrics(response_time, request_level, cache_hit=False, error=True)
        logger.error(f"Model not found: {str(e)}")
        return jsonify({'error': f'Model not found: {str(e)}'}), 404
    except ValueError as e:
        error_occurred = True
        response_time = time.time() - start_time
        if request_level:
            update_metrics(response_time, request_level, cache_hit=False, error=True)
        logger.error(f"Value error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        error_occurred = True
        response_time = time.time() - start_time
        if request_level:
            update_metrics(response_time, request_level, cache_hit=False, error=True)
        logger.error(f"Internal server error: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500
    finally:
        # Always update error metrics if an error occurred
        if error_occurred and request_level:
            final_response_time = time.time() - start_time
            update_metrics(final_response_time, request_level or 1500, cache_hit=False, error=True)


def predict_move_with_metrics(fen_string: str, level: int = 1500, nodes: int = 1):
    """
    Wrapper around predict_move that tracks engine caching.
    Returns tuple of (move, was_engine_cached)
    """
    from maia_engine import _engine_cache
    
    # Check if engine is already cached
    engine_was_cached = level in _engine_cache
    
    # Call the original predict_move function
    move = predict_move(fen_string, level, nodes)
    
    return move, engine_was_cached


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)