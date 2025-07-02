#!/usr/bin/env python3
"""
Simple tests for the Maia Chess Backend API
"""

import json
import unittest
from app import app


class TestMaiaBackendAPI(unittest.TestCase):
    """Test cases for the Maia Chess Backend API."""

    def setUp(self):
        """Set up test fixtures."""
        self.app = app.test_client()
        self.app.testing = True

    def test_health_check_endpoint(self):
        """Test the health check endpoint."""
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data.decode())
        self.assertEqual(data['status'], 'ok')
        self.assertEqual(data['message'], 'Maia Chess Backend is running')
        self.assertEqual(data['version'], '1.0.0')

    def test_health_check_response_format(self):
        """Test that the health check response has the correct format."""
        response = self.app.get('/')
        self.assertEqual(response.content_type, 'application/json')
        
        data = json.loads(response.data.decode())
        self.assertIn('status', data)
        self.assertIn('message', data)
        self.assertIn('version', data)


if __name__ == '__main__':
    unittest.main()