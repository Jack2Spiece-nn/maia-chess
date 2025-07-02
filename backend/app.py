#!/usr/bin/env python3
"""
Maia Chess Backend API

A lightweight Flask application that serves as the API for the Maia chess engine.
"""

from flask import Flask, jsonify, request
from maia_engine import predict_move

app = Flask(__name__)


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
        "level": 1500  # optional, defaults to 1500
    }
    
    Returns:
    {
        "move": "e2e4",
        "level": 1500
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
        
        # Get the predicted move
        move = predict_move(fen, level)
        
        return jsonify({
            'move': move,
            'level': level
        })
        
    except FileNotFoundError as e:
        return jsonify({'error': f'Model not found: {str(e)}'}), 404
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)