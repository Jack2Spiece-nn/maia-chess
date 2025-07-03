#!/usr/bin/env python3
"""
Maia Chess Backend API

A lightweight Flask application that serves as the API for the Maia chess engine.
"""

import time
import logging
from flask import Flask, jsonify, request
from maia_engine import predict_move, get_engine_status
from flask_cors import CORS

# Configure structured logging for production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Enable Cross-Origin Resource Sharing so that the React frontend
# served from a different domain/port can access this API without
# additional proxy configuration.
app = Flask(__name__)
CORS(app)  # allow all origins by default; restrict in production if needed

# Track request metrics
request_count = 0
error_count = 0
total_response_time = 0.0


@app.before_request
def log_request_info():
    """Log incoming request details."""
    global request_count
    request_count += 1
    
    logger.info(f"Request {request_count}: {request.method} {request.path}")
    logger.debug(f"Headers: {dict(request.headers)}")
    
    if request.is_json:
        logger.debug(f"JSON payload: {request.get_json()}")
    
    # Store request start time for response time tracking
    request.start_time = time.time()


@app.after_request
def log_response_info(response):
    """Log response details and performance metrics."""
    global total_response_time
    
    # Calculate response time
    if hasattr(request, 'start_time'):
        response_time = time.time() - request.start_time
        total_response_time += response_time
        
        logger.info(f"Response: {response.status_code} ({response_time:.3f}s)")
        
        # Log slow requests
        if response_time > 2.0:
            logger.warning(f"Slow response detected: {response_time:.3f}s for {request.path}")
    
    return response


@app.route('/')
def health_check():
    """Health check endpoint to confirm the server is running."""
    logger.debug("Health check requested")
    
    avg_response_time = total_response_time / max(request_count, 1)
    
    health_data = {
        'status': 'ok',
        'message': 'Maia Chess Backend is running',
        'version': '1.0.0',
        'metrics': {
            'request_count': request_count,
            'error_count': error_count,
            'avg_response_time': round(avg_response_time, 3)
        }
    }
    
    logger.info(f"Health check response: {health_data}")
    return jsonify(health_data)


@app.route('/status')
def detailed_status():
    """Detailed status endpoint for debugging production issues."""
    logger.info("Detailed status requested")
    
    try:
        engine_status = get_engine_status()
        
        status_data = {
            'server': {
                'status': 'ok',
                'version': '1.0.0',
                'request_count': request_count,
                'error_count': error_count,
                'avg_response_time': round(total_response_time / max(request_count, 1), 3)
            },
            'engines': engine_status,
            'timestamp': time.time()
        }
        
        logger.info("Detailed status generated successfully")
        return jsonify(status_data)
        
    except Exception as e:
        logger.error(f"Error generating detailed status: {e}")
        global error_count
        error_count += 1
        
        return jsonify({
            'error': 'Failed to generate detailed status',
            'message': str(e)
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
        "nodes": 1
    }
    """
    start_time = time.time()
    global error_count
    
    try:
        # Check if request has JSON content type
        if not request.is_json:
            logger.warning("Request without JSON content type")
            error_count += 1
            return jsonify({'error': 'Request must contain JSON data'}), 400
        
        # Get JSON data from request
        data = request.get_json()
        if not data:
            logger.warning("Request with empty JSON data")
            error_count += 1
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract FEN string
        fen = data.get('fen')
        if not fen:
            logger.warning("Request missing FEN string")
            error_count += 1
            return jsonify({'error': 'FEN string is required'}), 400
        
        # Extract level (optional, defaults to 1500)
        level = data.get('level', 1500)
        
        # Validate level is an integer
        try:
            level = int(level)
        except (ValueError, TypeError):
            logger.warning(f"Invalid level parameter: {level}")
            error_count += 1
            return jsonify({'error': 'Level must be an integer'}), 400
        
        # Extract nodes (optional, defaults to 1)
        nodes = data.get('nodes', 1)
        
        # Validate nodes is an integer
        try:
            nodes = int(nodes)
        except (ValueError, TypeError):
            logger.warning(f"Invalid nodes parameter: {nodes}")
            error_count += 1
            return jsonify({'error': 'Nodes must be an integer'}), 400
        
        logger.info(f"Move request: level={level}, nodes={nodes}")
        logger.debug(f"FEN: {fen}")
        
        # Get the predicted move
        move = predict_move(fen, level, nodes)
        
        response_time = time.time() - start_time
        logger.info(f"Move prediction successful: {move} ({response_time:.3f}s)")
        
        return jsonify({
            'move': move,
            'level': level,
            'nodes': nodes,
            'response_time': round(response_time, 3)
        })
        
    except FileNotFoundError as e:
        logger.error(f"Model not found: {e}")
        error_count += 1
        return jsonify({'error': f'Model not found: {str(e)}'}), 404
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        error_count += 1
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Internal server error: {e}")
        error_count += 1
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    logger.warning(f"404 error: {request.path}")
    global error_count
    error_count += 1
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"500 error: {error}")
    global error_count
    error_count += 1
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    logger.info("Starting Maia Chess Backend")
    
    # Log environment status on startup
    try:
        status = get_engine_status()
        logger.info(f"Startup status: {status}")
    except Exception as e:
        logger.warning(f"Could not get engine status on startup: {e}")
    
    app.run(host='0.0.0.0', port=5000, debug=True)