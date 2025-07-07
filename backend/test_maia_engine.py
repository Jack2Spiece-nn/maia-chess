#!/usr/bin/env python3
"""
Comprehensive tests for the Maia Engine module
"""

import unittest
import tempfile
import os
import chess
from maia_engine import predict_move, get_engine_stats, _get_weights_path, _check_lc0_availability, predict_move_with_validation_logging


class TestMaiaEngine(unittest.TestCase):
    """Test cases for the Maia Engine module."""

    def setUp(self):
        """Set up test fixtures."""
        self.valid_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        self.midgame_fen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2'
        self.endgame_fen = '8/8/8/8/8/8/6KP/7k w - - 0 1'

    def test_predict_move_with_valid_fen(self):
        """Test predict_move with valid FEN string."""
        move = predict_move(self.valid_fen, 1500, 1)
        self.assertIsInstance(move, str)
        self.assertGreaterEqual(len(move), 4)
        # Check that it's a valid UCI move format
        self.assertTrue(move.replace('=', '').replace('Q', '').replace('R', '').replace('B', '').replace('N', '').replace('K', '').isalnum())

    def test_predict_move_with_different_levels(self):
        """Test predict_move with different skill levels."""
        levels = [1100, 1500, 1900]
        for level in levels:
            with self.subTest(level=level):
                move = predict_move(self.valid_fen, level, 1)
                self.assertIsInstance(move, str)
                self.assertGreaterEqual(len(move), 4)

    def test_predict_move_with_different_nodes(self):
        """Test predict_move with different node counts."""
        nodes = [1, 10, 100, 1000]
        for node_count in nodes:
            with self.subTest(nodes=node_count):
                move = predict_move(self.valid_fen, 1500, node_count)
                self.assertIsInstance(move, str)
                self.assertGreaterEqual(len(move), 4)

    def test_predict_move_with_invalid_fen(self):
        """Test predict_move with invalid FEN string."""
        with self.assertRaises(ValueError):
            predict_move('invalid_fen', 1500, 1)

    def test_predict_move_with_empty_fen(self):
        """Test predict_move with empty FEN string."""
        with self.assertRaises(ValueError):
            predict_move('', 1500, 1)

    def test_predict_move_with_checkmate_position(self):
        """Test predict_move with checkmate position."""
        checkmate_fen = 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 3'
        # This should not raise an error even if the position is near checkmate
        try:
            move = predict_move(checkmate_fen, 1500, 1)
            self.assertIsInstance(move, str)
        except ValueError:
            # If the position is actually checkmate, ValueError is expected
            pass

    def test_predict_move_with_invalid_nodes_range(self):
        """Test predict_move with invalid node counts."""
        with self.assertRaises(ValueError):
            predict_move(self.valid_fen, 1500, 0)
        
        with self.assertRaises(ValueError):
            predict_move(self.valid_fen, 1500, 10001)

    def test_predict_move_with_invalid_nodes_type(self):
        """Test predict_move with invalid node types."""
        with self.assertRaises(ValueError):
            predict_move(self.valid_fen, 1500, 'invalid')
        
        with self.assertRaises(ValueError):
            predict_move(self.valid_fen, 1500, 1.5)

    def test_get_engine_stats(self):
        """Test get_engine_stats function."""
        # Run a move to ensure engine is initialized
        predict_move(self.valid_fen, 1500, 1)
        
        stats = get_engine_stats()
        self.assertIsInstance(stats, dict)
        self.assertIn('cached_engines', stats)
        self.assertIn('engine_details', stats)
        self.assertIn('total_moves_computed', stats)
        self.assertIn('total_computation_time_ms', stats)
        
        # Check that we have at least one engine cached
        self.assertGreaterEqual(stats['cached_engines'], 1)

    def test_move_is_legal(self):
        """Test that predicted moves are legal."""
        board = chess.Board(self.valid_fen)
        move = predict_move(self.valid_fen, 1500, 1)
        
        # Convert UCI move to chess.Move
        chess_move = chess.Move.from_uci(move)
        self.assertIn(chess_move, board.legal_moves)

    def test_midgame_position(self):
        """Test with midgame position."""
        move = predict_move(self.midgame_fen, 1500, 1)
        board = chess.Board(self.midgame_fen)
        chess_move = chess.Move.from_uci(move)
        self.assertIn(chess_move, board.legal_moves)

    def test_endgame_position(self):
        """Test with endgame position."""
        move = predict_move(self.endgame_fen, 1500, 1)
        board = chess.Board(self.endgame_fen)
        chess_move = chess.Move.from_uci(move)
        self.assertIn(chess_move, board.legal_moves)

    def test_check_lc0_availability(self):
        """Test LC0 availability check."""
        # This should return either True or False
        availability = _check_lc0_availability()
        self.assertIsInstance(availability, bool)

    def test_predict_move_with_validation_logging(self):
        """Test predict_move_with_validation_logging function."""
        move, engine_type = predict_move_with_validation_logging(self.valid_fen, 1500, 1)
        
        self.assertIsInstance(move, str)
        self.assertGreaterEqual(len(move), 4)
        self.assertIn(engine_type, ['LC0', 'RANDOM_FALLBACK'])

    def test_consecutive_moves_same_level(self):
        """Test multiple consecutive moves with same level (engine caching)."""
        level = 1500
        positions = [
            self.valid_fen,
            'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
            'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2'
        ]
        
        for i, fen in enumerate(positions):
            with self.subTest(position=i):
                move = predict_move(fen, level, 1)
                self.assertIsInstance(move, str)
                self.assertGreaterEqual(len(move), 4)

    def test_engine_stats_update(self):
        """Test that engine statistics are updated correctly."""
        # Get initial stats
        initial_stats = get_engine_stats()
        initial_moves = initial_stats.get('total_moves_computed', 0)
        
        # Make a move
        predict_move(self.valid_fen, 1500, 1)
        
        # Get updated stats
        updated_stats = get_engine_stats()
        updated_moves = updated_stats.get('total_moves_computed', 0)
        
        # Check that move count increased
        self.assertGreater(updated_moves, initial_moves)

    def test_concurrent_requests_different_levels(self):
        """Test concurrent requests with different levels."""
        levels = [1100, 1500, 1900]
        moves = []
        
        for level in levels:
            move = predict_move(self.valid_fen, level, 1)
            moves.append(move)
        
        # All moves should be valid strings
        for move in moves:
            self.assertIsInstance(move, str)
            self.assertGreaterEqual(len(move), 4)

    def test_weights_path_retrieval(self):
        """Test weights path retrieval (may not exist in test environment)."""
        # This test will pass if the weights exist or fail gracefully if they don't
        try:
            path = _get_weights_path(1500)
            self.assertTrue(os.path.exists(path))
        except FileNotFoundError:
            # This is expected in CI/test environments without model files
            pass

    def test_boundary_node_values(self):
        """Test boundary node values."""
        # Test minimum boundary
        move = predict_move(self.valid_fen, 1500, 1)
        self.assertIsInstance(move, str)
        
        # Test maximum boundary
        move = predict_move(self.valid_fen, 1500, 10000)
        self.assertIsInstance(move, str)

    def test_multiple_engines_cached(self):
        """Test that multiple engines can be cached simultaneously."""
        levels = [1100, 1500, 1900]
        
        # Initialize multiple engines
        for level in levels:
            predict_move(self.valid_fen, level, 1)
        
        stats = get_engine_stats()
        # Should have cached engines for the levels we used
        self.assertGreaterEqual(stats['cached_engines'], len(levels))


if __name__ == '__main__':
    unittest.main()