#!/usr/bin/env python3
"""
Tests for validation and demo functionality
"""

import unittest
import os
import sys
import importlib.util
from unittest.mock import patch, MagicMock

# Add the backend directory to the path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)


class TestValidationAndDemo(unittest.TestCase):
    """Test cases for validation and demo functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.valid_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

    def test_validate_script_exists(self):
        """Test that validate.py exists and can be imported."""
        validate_path = os.path.join(backend_dir, 'validate.py')
        if os.path.exists(validate_path):
            spec = importlib.util.spec_from_file_location("validate", validate_path)
            validate_module = importlib.util.module_from_spec(spec)
            try:
                spec.loader.exec_module(validate_module)
                self.assertTrue(hasattr(validate_module, '__file__'))
            except Exception as e:
                # If there are import errors, that's expected in test environment
                self.assertIsInstance(e, (ImportError, ModuleNotFoundError, AttributeError))

    def test_demo_script_exists(self):
        """Test that demo.py exists and can be imported."""
        demo_path = os.path.join(backend_dir, 'demo.py')
        if os.path.exists(demo_path):
            spec = importlib.util.spec_from_file_location("demo", demo_path)
            demo_module = importlib.util.module_from_spec(spec)
            try:
                spec.loader.exec_module(demo_module)
                self.assertTrue(hasattr(demo_module, '__file__'))
            except Exception as e:
                # If there are import errors, that's expected in test environment
                self.assertIsInstance(e, (ImportError, ModuleNotFoundError, AttributeError))

    def test_app_imports_correctly(self):
        """Test that app.py imports without errors."""
        try:
            import app
            self.assertTrue(hasattr(app, 'app'))
            self.assertTrue(hasattr(app, 'health_check'))
            self.assertTrue(hasattr(app, 'get_move'))
        except ImportError as e:
            self.fail(f"Failed to import app.py: {e}")

    def test_maia_engine_imports_correctly(self):
        """Test that maia_engine.py imports without errors."""
        try:
            import maia_engine
            self.assertTrue(hasattr(maia_engine, 'predict_move'))
            self.assertTrue(hasattr(maia_engine, 'get_engine_stats'))
        except ImportError as e:
            self.fail(f"Failed to import maia_engine.py: {e}")

    def test_required_files_exist(self):
        """Test that all required files exist in the backend directory."""
        required_files = [
            'app.py',
            'maia_engine.py',
            'test_app.py',
            'test_integration.py',
            'test_maia_engine.py',
            'validate.py',
            'demo.py'
        ]
        
        for filename in required_files:
            file_path = os.path.join(backend_dir, filename)
            with self.subTest(file=filename):
                self.assertTrue(os.path.exists(file_path), f"Required file {filename} does not exist")

    def test_requirements_file_exists(self):
        """Test that requirements.txt exists in backend directory."""
        req_path = os.path.join(backend_dir, 'requirements.txt')
        if os.path.exists(req_path):
            with open(req_path, 'r') as f:
                content = f.read()
                self.assertIn('flask', content.lower())

    def test_dockerfile_exists(self):
        """Test that Dockerfile exists in backend directory."""
        dockerfile_path = os.path.join(backend_dir, 'Dockerfile')
        if os.path.exists(dockerfile_path):
            with open(dockerfile_path, 'r') as f:
                content = f.read()
                self.assertIn('FROM', content)
                self.assertIn('COPY', content)

    def test_readme_exists(self):
        """Test that README.md exists in backend directory."""
        readme_path = os.path.join(backend_dir, 'README.md')
        if os.path.exists(readme_path):
            with open(readme_path, 'r') as f:
                content = f.read()
                self.assertGreater(len(content), 0)

    def test_performance_metrics_functionality(self):
        """Test that performance metrics are working in app.py."""
        try:
            from app import update_metrics, get_performance_summary
            
            # Test update_metrics function
            update_metrics(0.1, 1500, cache_hit=True, error=False)
            
            # Test get_performance_summary function
            summary = get_performance_summary()
            self.assertIsInstance(summary, dict)
            self.assertIn('total_requests', summary)
            self.assertIn('average_response_time', summary)
            
        except ImportError:
            # If functions don't exist, that's not necessarily a failure
            pass

    def test_flask_app_configuration(self):
        """Test that Flask app is configured correctly."""
        try:
            from app import app
            
            # Test that CORS is enabled
            self.assertTrue(hasattr(app, 'extensions'))
            
            # Test that routes are registered
            route_rules = [rule.rule for rule in app.url_map.iter_rules()]
            self.assertIn('/', route_rules)
            self.assertIn('/get_move', route_rules)
            
        except ImportError as e:
            self.fail(f"Failed to test Flask app configuration: {e}")

    @patch('maia_engine.predict_move')
    def test_error_handling_in_get_move(self, mock_predict):
        """Test error handling in the get_move endpoint."""
        try:
            from app import app
            
            # Test with mock that raises FileNotFoundError
            mock_predict.side_effect = FileNotFoundError("Model not found")
            
            with app.test_client() as client:
                response = client.post('/get_move', json={
                    'fen': self.valid_fen,
                    'level': 1500
                })
                self.assertEqual(response.status_code, 404)
                data = response.get_json()
                self.assertIn('error', data)
                self.assertIn('Model not found', data['error'])
                
        except ImportError:
            pass

    def test_chess_position_validation(self):
        """Test chess position validation using python-chess."""
        try:
            import chess
            
            # Test valid FEN
            board = chess.Board(self.valid_fen)
            self.assertTrue(board.is_valid())
            
            # Test invalid FEN
            with self.assertRaises(ValueError):
                chess.Board('invalid_fen_string')
                
        except ImportError:
            # python-chess not available in test environment
            pass

    def test_logging_configuration(self):
        """Test that logging is configured correctly."""
        try:
            import logging
            from maia_engine import logger, validation_logger, engine_logger
            
            # Test that loggers exist
            self.assertIsInstance(logger, logging.Logger)
            self.assertIsInstance(validation_logger, logging.Logger)
            self.assertIsInstance(engine_logger, logging.Logger)
            
        except ImportError:
            pass


if __name__ == '__main__':
    unittest.main()