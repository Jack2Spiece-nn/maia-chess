#!/usr/bin/env python3
"""
Maia Chess Backend API

A lightweight Flask application that serves as the API for the Maia chess engine.
"""

import os
import re
from flask import Flask, jsonify, request
from maia_engine import predict_move
from flask_cors import CORS

# Enable Cross-Origin Resource Sharing so that the React frontend
# served from a different domain/port can access this API without
# additional proxy configuration.
app = Flask(__name__)

def is_valid_render_origin(origin):
    """
    Check if the origin is a valid Render deployment URL.
    Supports both main deployment and preview deployment patterns.
    """
    if not origin:
        return False
    
    # Main deployment URL
    if origin == 'https://maia-chess-frontend.onrender.com':
        return True
    
    # Preview deployment pattern: https://maia-chess-frontend-pr-123.onrender.com
    # or other patterns like: https://maia-chess-frontend-abc123.onrender.com
    preview_pattern = r'^https://maia-chess-frontend-[a-zA-Z0-9\-]+\.onrender\.com$'
    if re.match(preview_pattern, origin):
        return True
    
    return False

# Configure CORS for render deployment
@app.after_request
def after_request(response):
    """Custom CORS handling for Render deployments."""
    origin = request.headers.get('Origin')
    
    if os.environ.get('ENVIRONMENT') == 'production':
        # Production: only allow Render deployment URLs
        if origin and is_valid_render_origin(origin):
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    else:
        # Development: allow all origins
        if origin:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    
    return response

# Basic CORS setup for OPTIONS requests
CORS(app, supports_credentials=False)

@app.route('/get_move', methods=['OPTIONS'])
def handle_options():
    """Handle preflight OPTIONS requests for CORS."""
    return '', 204

@app.route('/')
def health_check():
    """Health check endpoint to confirm the server is running."""
    return jsonify({
        'status': 'ok',
        'message': 'Maia Chess Backend is running',
        'version': '1.0.0'
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
        "nodes": 1
    }
    """
    try:
        # Check if request has JSON content type
        if not request.is_json:
            return jsonify({'error': 'Request must contain JSON data'}), 400
        
        # Get JSON data from request
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract FEN string
        fen = data.get('fen')
        if not fen:
            return jsonify({'error': 'FEN string is required'}), 400
        
        # Extract level (optional, defaults to 1500)
        level = data.get('level', 1500)
        
        # Validate level is an integer
        try:
            level = int(level)
        except (ValueError, TypeError):
            return jsonify({'error': 'Level must be an integer'}), 400
        
        # Extract nodes (optional, defaults to 1)
        nodes = data.get('nodes', 1)
        
        # Validate nodes is an integer and within valid range
        try:
            nodes = int(nodes)
            if nodes < 1 or nodes > 10000:
                return jsonify({'error': 'Nodes must be between 1 and 10000'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Nodes must be an integer'}), 400
        
        # Get the predicted move
        move = predict_move(fen, level, nodes)
        
        return jsonify({
            'move': move,
            'level': level,
            'nodes': nodes
        })
        
    except FileNotFoundError as e:
        return jsonify({'error': f'Model not found: {str(e)}'}), 404
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


if __name__ == '__main__':
    # Use environment variables for configuration
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('ENVIRONMENT') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug)