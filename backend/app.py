#!/usr/bin/env python3
"""
Maia Chess Backend API

A lightweight Flask application that serves as the API for the Maia chess engine.
"""

from flask import Flask, jsonify

app = Flask(__name__)


@app.route('/')
def health_check():
    """Health check endpoint to confirm the server is running."""
    return jsonify({
        'status': 'ok',
        'message': 'Maia Chess Backend is running',
        'version': '1.0.0'
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)