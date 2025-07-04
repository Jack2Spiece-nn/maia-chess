#!/usr/bin/env python3
"""
Maia Chess Backend API

A lightweight Flask application that serves as the API for the Maia chess engine.
Enhanced with performance optimizations and comprehensive monitoring.
"""

import time
import logging
import gzip
import io
from collections import defaultdict, deque
from threading import Lock
from flask import Flask, jsonify, request, g
from maia_engine import predict_move, validate_engine_performance, monitor_memory_usage, warm_engines
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
    'compression_stats': {
        'compressed_responses': 0,
        'total_bytes_saved': 0,
        'compression_time': 0.0
    },
    'network_performance': []  # Track network performance metrics
}
metrics_lock = Lock()

def gzip_response(response_data):
    """Compress response data using gzip"""
    if isinstance(response_data, str):
        response_data = response_data.encode('utf-8')
    
    start_time = time.time()
    buffer = io.BytesIO()
    
    with gzip.GzipFile(fileobj=buffer, mode='wb') as f:
        f.write(response_data)
    
    compressed_data = buffer.getvalue()
    compression_time = time.time() - start_time
    compression_ratio = len(compressed_data) / len(response_data) if response_data else 1
    
    # Update compression stats
    with metrics_lock:
        performance_metrics['compression_stats']['compressed_responses'] += 1
        performance_metrics['compression_stats']['total_bytes_saved'] += (len(response_data) - len(compressed_data))
        performance_metrics['compression_stats']['compression_time'] += compression_time
    
    logger.debug(f"Compressed response: {len(response_data)} -> {len(compressed_data)} bytes ({compression_ratio:.2%})")
    
    return compressed_data

@app.before_request
def before_request():
    """Set up request timing and connection optimization"""
    g.start_time = time.time()
    
    # Log request details for validation
    logger.info(f"REQUEST: {request.method} {request.path} from {request.remote_addr}")

@app.after_request
def after_request(response):
    """Add performance headers and optimize connection"""
    # Add connection optimization headers
    response.headers['Connection'] = 'keep-alive'
    response.headers['Keep-Alive'] = 'timeout=5, max=1000'
    
    # Add performance headers
    if hasattr(g, 'start_time'):
        request_time = (time.time() - g.start_time) * 1000
        response.headers['X-Response-Time'] = f"{request_time:.2f}ms"
    
    # Add compression support
    if 'gzip' in request.headers.get('Accept-Encoding', ''):
        response.headers['Content-Encoding'] = 'gzip'
        response.headers['Vary'] = 'Accept-Encoding'
    
    # CORS optimization
    response.headers['Access-Control-Max-Age'] = '3600'  # Cache preflight for 1 hour
    
    # Security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    logger.debug(f"RESPONSE: {response.status_code} - {request.path}")
    return response

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

def log_network_performance(response_time: float, endpoint: str, status_code: int):
    """Log network performance metrics for validation"""
    network_metric = {
        'timestamp': time.time(),
        'endpoint': endpoint,
        'response_time_ms': response_time * 1000,
        'status_code': status_code,
        'user_agent': request.headers.get('User-Agent', 'Unknown')[:50],  # Truncate for storage
        'connection_type': 'keep-alive' if 'keep-alive' in request.headers.get('Connection', '').lower() else 'close'
    }
    
    with metrics_lock:
        performance_metrics['network_performance'].append(network_metric)
        # Keep only last 1000 network metrics
        if len(performance_metrics['network_performance']) > 1000:
            performance_metrics['network_performance'] = performance_metrics['network_performance'][-1000:]
    
    logger.info(f"NETWORK_PERFORMANCE: {network_metric}")

def get_performance_summary():
    """Get a summary of performance metrics."""
    with metrics_lock:
        total_requests = performance_metrics['total_requests']
        recent_times = list(performance_metrics['recent_response_times'])
        
        # Network performance summary
        recent_network = performance_metrics['network_performance'][-50:] if performance_metrics['network_performance'] else []
        network_summary = {}
        if recent_network:
            avg_response_time = sum(n['response_time_ms'] for n in recent_network) / len(recent_network)
            success_rate = len([n for n in recent_network if n['status_code'] < 400]) / len(recent_network)
            network_summary = {
                'avg_response_time_ms': round(avg_response_time, 2),
                'success_rate': round(success_rate, 3),
                'total_requests': len(recent_network)
            }
        
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
            },
            'compression_stats': dict(performance_metrics['compression_stats']),
            'network_performance': network_summary
        }


@app.route('/')
def health_check():
    """Health check endpoint to confirm the server is running."""
    start_time = time.time()
    
    # Run memory monitoring
    current_memory = monitor_memory_usage()
    
    perf_summary = get_performance_summary()
    
    response_data = {
        'status': 'ok',
        'message': 'Maia Chess Backend is running',
        'version': '1.1.0',  # Updated version with optimizations
        'performance': {
            'total_requests': perf_summary['total_requests'],
            'average_response_time_ms': round(perf_summary['average_response_time'] * 1000, 2),
            'recent_average_ms': round(perf_summary['recent_average'] * 1000, 2),
            'error_rate': (
                perf_summary['error_count'] / perf_summary['total_requests'] 
                if perf_summary['total_requests'] > 0 else 0
            ),
            'memory_usage_mb': round(current_memory, 2)
        },
        'optimization_features': [
            'response_compression',
            'connection_keep_alive',
            'engine_caching',
            'performance_monitoring',
            'memory_optimization'
        ]
    }
    
    response_time = time.time() - start_time
    log_network_performance(response_time, '/', 200)
    
    return jsonify(response_data)


@app.route('/metrics')
def get_metrics():
    """Detailed performance metrics endpoint."""
    start_time = time.time()
    
    from maia_engine import get_engine_stats
    
    api_metrics = get_performance_summary()
    engine_metrics = get_engine_stats()
    
    response_data = {
        'api_performance': api_metrics,
        'engine_performance': engine_metrics,
        'timestamp': time.time(),
        'system_info': {
            'memory_usage_mb': monitor_memory_usage(),
            'uptime_seconds': time.time() - app.config.get('START_TIME', time.time())
        }
    }
    
    response_time = time.time() - start_time
    log_network_performance(response_time, '/metrics', 200)
    
    return jsonify(response_data)


@app.route('/validate')
def validate_performance():
    """Endpoint to trigger engine performance validation"""
    start_time = time.time()
    
    try:
        # Run validation on multiple levels
        validation_results = {}
        test_levels = [1100, 1500, 1900]
        
        for level in test_levels:
            validation_results[level] = validate_engine_performance(level)
        
        overall_avg_time = sum(r['move_calculation_time_ms'] for r in validation_results.values()) / len(validation_results)
        overall_success_rate = sum(1 for r in validation_results.values() if r['success']) / len(validation_results)
        
        response_data = {
            'status': 'validation_complete',
            'individual_results': validation_results,
            'summary': {
                'overall_avg_response_time_ms': round(overall_avg_time, 2),
                'overall_success_rate': overall_success_rate,
                'levels_tested': test_levels,
                'validation_timestamp': time.time()
            },
            'performance_grade': 'A' if overall_avg_time < 1000 and overall_success_rate == 1.0 else 
                                'B' if overall_avg_time < 2000 and overall_success_rate >= 0.9 else 
                                'C' if overall_avg_time < 3000 else 'D'
        }
        
        response_time = time.time() - start_time
        log_network_performance(response_time, '/validate', 200)
        
        return jsonify(response_data)
        
    except Exception as e:
        response_time = time.time() - start_time
        log_network_performance(response_time, '/validate', 500)
        
        return jsonify({
            'status': 'validation_failed',
            'error': str(e),
            'timestamp': time.time()
        }), 500


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
        "engine_cached": true,
        "performance_metrics": {...}
    }
    """
    start_time = time.time()
    request_level = None
    error_occurred = False
    
    try:
        # Check if request has JSON content type
        if not request.is_json:
            error_occurred = True
            response_time = time.time() - start_time
            log_network_performance(response_time, '/get_move', 400)
            return jsonify({'error': 'Request must contain JSON data'}), 400
        
        # Get JSON data from request
        data = request.get_json()
        if not data:
            error_occurred = True
            response_time = time.time() - start_time
            log_network_performance(response_time, '/get_move', 400)
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract FEN string
        fen = data.get('fen')
        if not fen:
            error_occurred = True
            response_time = time.time() - start_time
            log_network_performance(response_time, '/get_move', 400)
            return jsonify({'error': 'FEN string is required'}), 400
        
        # Extract level (optional, defaults to 1500)
        level = data.get('level', 1500)
        
        # Validate level is an integer
        try:
            level = int(level)
            request_level = level
        except (ValueError, TypeError):
            error_occurred = True
            response_time = time.time() - start_time
            log_network_performance(response_time, '/get_move', 400)
            return jsonify({'error': 'Level must be an integer'}), 400
        
        # Extract nodes (optional, defaults to 1)
        nodes = data.get('nodes', 1)
        
        # Validate nodes is an integer
        try:
            nodes = int(nodes)
        except (ValueError, TypeError):
            error_occurred = True
            response_time = time.time() - start_time
            log_network_performance(response_time, '/get_move', 400)
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
        
        # Enhanced response with performance metrics
        response_data = {
            'move': move,
            'level': level,
            'nodes': nodes,
            'response_time_ms': round(response_time * 1000, 2),
            'engine_cached': engine_was_cached,
            'computation_time_ms': round(move_time * 1000, 2),
            'engine_type': engine_type,  # For validation purposes
            'performance_metrics': {
                'memory_usage_mb': round(monitor_memory_usage(), 2),
                'cache_efficiency': engine_was_cached,
                'optimization_active': True
            }
        }
        
        log_network_performance(response_time, '/get_move', 200)
        
        return jsonify(response_data)
        
    except FileNotFoundError as e:
        error_occurred = True
        response_time = time.time() - start_time
        if request_level:
            update_metrics(response_time, request_level, cache_hit=False, error=True)
        log_network_performance(response_time, '/get_move', 404)
        logger.error(f"Model not found: {str(e)}")
        return jsonify({'error': f'Model not found: {str(e)}'}), 404
    except ValueError as e:
        error_occurred = True
        response_time = time.time() - start_time
        if request_level:
            update_metrics(response_time, request_level, cache_hit=False, error=True)
        log_network_performance(response_time, '/get_move', 400)
        logger.error(f"Value error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        error_occurred = True
        response_time = time.time() - start_time
        if request_level:
            update_metrics(response_time, request_level, cache_hit=False, error=True)
        log_network_performance(response_time, '/get_move', 500)
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


# Initialize application
app.config['START_TIME'] = time.time()

# Pre-warm engines if environment variable is set
import os
if os.environ.get("WARM_ENGINES_ON_STARTUP", "false").lower() == "true":
    logger.info("Pre-warming engines on startup...")
    try:
        warm_engines([1500])  # Start with most popular level
        logger.info("Engine pre-warming completed successfully")
    except Exception as e:
        logger.warning(f"Failed to pre-warm engines on startup: {e}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)