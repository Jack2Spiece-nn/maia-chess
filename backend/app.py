#!/usr/bin/env python3
"""
Maia Chess Backend API

A lightweight Flask application that serves as the API for the Maia chess engine.
"""

import os
from flask import Flask, jsonify, request
from maia_engine import predict_move
from flask_cors import CORS

# Enable Cross-Origin Resource Sharing so that the React frontend
# served from a different domain/port can access this API without
# additional proxy configuration.
app = Flask(__name__)

# Configure CORS for render deployment
if os.environ.get('ENVIRONMENT') == 'production':
    # Production CORS for render
    CORS(app, origins=[
        'https://maia-chess-frontend.onrender.com',
        'https://maia-chess-frontend-*.onrender.com'  # Handle preview deployments
    ])
else:
    # Development CORS
    CORS(app)


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