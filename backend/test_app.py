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

    def test_get_move_endpoint_with_valid_fen(self):
        """Test the get_move endpoint with a valid FEN string."""
        payload = {
            'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            'level': 1500
        }
        response = self.app.post('/get_move', 
                                json=payload,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data.decode())
        self.assertIn('move', data)
        self.assertIn('level', data)
        self.assertEqual(data['level'], 1500)
        # Move should be a valid UCI string (e.g., "e2e4")
        self.assertIsInstance(data['move'], str)
        self.assertTrue(len(data['move']) >= 4)

    def test_get_move_endpoint_with_default_level(self):
        """Test the get_move endpoint with default level."""
        payload = {
            'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        }
        response = self.app.post('/get_move', 
                                json=payload,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data.decode())
        self.assertIn('move', data)
        self.assertIn('level', data)
        self.assertEqual(data['level'], 1500)  # Default level

    def test_get_move_endpoint_missing_fen(self):
        """Test the get_move endpoint without FEN string."""
        payload = {'level': 1500}
        response = self.app.post('/get_move', 
                                json=payload,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data.decode())
        self.assertIn('error', data)
        self.assertIn('FEN string is required', data['error'])

    def test_get_move_endpoint_invalid_fen(self):
        """Test the get_move endpoint with invalid FEN string."""
        payload = {
            'fen': 'invalid_fen_string',
            'level': 1500
        }
        response = self.app.post('/get_move', 
                                json=payload,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data.decode())
        self.assertIn('error', data)

    def test_get_move_endpoint_invalid_level(self):
        """Test the get_move endpoint with invalid level."""
        payload = {
            'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            'level': 'invalid_level'
        }
        response = self.app.post('/get_move', 
                                json=payload,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data.decode())
        self.assertIn('error', data)
        self.assertIn('Level must be an integer', data['error'])

    def test_get_move_endpoint_no_json(self):
        """Test the get_move endpoint without JSON data."""
        response = self.app.post('/get_move')
        
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data.decode())
        self.assertIn('error', data)
        self.assertIn('Request must contain JSON data', data['error'])

    def test_get_move_endpoint_nonexistent_model_level(self):
        """Test the get_move endpoint with a model level that doesn't exist."""
        payload = {
            'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            'level': 9999  # This level should not exist
        }
        response = self.app.post('/get_move', 
                                json=payload,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 404)
        
        data = json.loads(response.data.decode())
        self.assertIn('error', data)
        self.assertIn('Model not found', data['error'])

    def test_get_move_endpoint_with_nodes(self):
        """Test the get_move endpoint with nodes parameter."""
        payload = {
            'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            'level': 1500,
            'nodes': 10
        }
        response = self.app.post('/get_move', 
                                json=payload,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data.decode())
        self.assertIn('move', data)
        self.assertIn('level', data)
        self.assertIn('nodes', data)
        self.assertEqual(data['level'], 1500)
        self.assertEqual(data['nodes'], 10)
        # Move should be a valid UCI string (e.g., "e2e4")
        self.assertIsInstance(data['move'], str)
        self.assertTrue(len(data['move']) >= 4)

    def test_get_move_endpoint_with_default_nodes(self):
        """Test the get_move endpoint with default nodes value."""
        payload = {
            'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            'level': 1500
        }
        response = self.app.post('/get_move', 
                                json=payload,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data.decode())
        self.assertIn('nodes', data)
        self.assertEqual(data['nodes'], 1)  # Default nodes

    def test_get_move_endpoint_invalid_nodes_string(self):
        """Test the get_move endpoint with invalid nodes parameter (string)."""
        payload = {
            'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            'level': 1500,
            'nodes': 'invalid_nodes'
        }
        response = self.app.post('/get_move', 
                                json=payload,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data.decode())
        self.assertIn('error', data)
        self.assertIn('Nodes must be an integer', data['error'])

    def test_get_move_endpoint_invalid_nodes_range_low(self):
        """Test the get_move endpoint with nodes value too low."""
        payload = {
            'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            'level': 1500,
            'nodes': 0
        }
        response = self.app.post('/get_move', 
                                json=payload,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data.decode())
        self.assertIn('error', data)
        self.assertIn('Nodes must be an integer between 1 and 10000', data['error'])

    def test_get_move_endpoint_invalid_nodes_range_high(self):
        """Test the get_move endpoint with nodes value too high."""
        payload = {
            'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            'level': 1500,
            'nodes': 10001
        }
        response = self.app.post('/get_move', 
                                json=payload,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data.decode())
        self.assertIn('error', data)
        self.assertIn('Nodes must be an integer between 1 and 10000', data['error'])

    def test_get_move_endpoint_nodes_boundary_values(self):
        """Test the get_move endpoint with nodes boundary values (1 and 10000)."""
        # Test minimum value
        payload = {
            'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            'level': 1500,
            'nodes': 1
        }
        response = self.app.post('/get_move', 
                                json=payload,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode())
        self.assertEqual(data['nodes'], 1)

        # Test maximum value
        payload['nodes'] = 10000
        response = self.app.post('/get_move', 
                                json=payload,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode())
        self.assertEqual(data['nodes'], 10000)


if __name__ == '__main__':
    unittest.main()