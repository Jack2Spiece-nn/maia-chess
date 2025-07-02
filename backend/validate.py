#!/usr/bin/env python3
"""
Validation script for the Maia Chess Backend API

This script demonstrates the API functionality and validates the deployment setup.
"""

import requests
import sys
import time


def test_local_server(port=5000):
    """Test the local Flask server."""
    print(f"Testing local server on port {port}...")
    try:
        response = requests.get(f'http://localhost:{port}/', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Health check passed: {data['message']}")
            print(f"✓ Version: {data['version']}")
            return True
        else:
            print(f"✗ Health check failed with status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Connection failed: {e}")
        return False


def validate_dependencies():
    """Validate that required dependencies are available."""
    print("Validating dependencies...")
    try:
        import flask
        print(f"✓ Flask version: {flask.__version__}")
    except ImportError:
        print("✗ Flask not available")
        return False
    
    try:
        import chess
        print(f"✓ python-chess version: {chess.__version__}")
    except ImportError:
        print("✗ python-chess not available")
        return False
    
    try:
        import gunicorn
        print(f"✓ Gunicorn available")
    except ImportError:
        print("✗ Gunicorn not available")
        return False
    
    return True


def main():
    """Main validation function."""
    print("Maia Chess Backend Validation")
    print("=" * 40)
    
    # Validate dependencies
    if not validate_dependencies():
        print("\n✗ Dependency validation failed")
        sys.exit(1)
    
    print("\n✓ All dependencies validated successfully")
    print("\nTo test the API:")
    print("1. Run: python app.py")
    print("2. Then run this script with: python validate.py")
    print("\nFor production deployment:")
    print("1. Use Docker: docker build -t maia-chess-backend . && docker run -p 5000:5000 maia-chess-backend")
    print("2. Or deploy to Render.com using render.yaml")


if __name__ == '__main__':
    main()