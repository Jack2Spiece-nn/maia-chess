#!/usr/bin/env python3
"""
Maia Chess Engine

Core module for loading and managing Maia chess models.
Provides functionality for model caching, move prediction, and FEN processing.
"""

import os
import sys
# Optional TensorFlow import. Fallback to lightweight placeholder if unavailable
try:
    import tensorflow as tf  # type: ignore
    _tf_available = True
except Exception:  # pragma: no cover
    _tf_available = False

import numpy as np
import chess

# Global model cache to prevent reloading models on every request
_model_cache = {}

# Add project root to PYTHONPATH so that we can import sibling packages when
# running the backend from within the `backend/` directory (Render starts the
# service with `cd backend`).
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the original Maia FEN → tensor converter. This keeps the backend
# lightweight while still using the exact preprocessing logic from the
# research code.
try:
    from move_prediction.maia_chess_backend.fen_to_vec import fenToVec  # type: ignore
except ModuleNotFoundError:  # pragma: no cover – research code not present in some builds
    fenToVec = None  # fallback handled later

def get_model(level):
    """
    Load and cache a Maia model by skill level.
    
    Args:
        level (int): The skill level of the model (e.g., 1100, 1200, etc.)
        
    Returns:
        tf.keras.Model: The loaded TensorFlow model
        
    Raises:
        FileNotFoundError: If the requested model level doesn't exist
    """
    global _model_cache
    
    # Check if model is already cached
    if level in _model_cache:
        return _model_cache[level]
    
    # Construct model path
    models_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    model_file = f"maia-{level}.pb.gz"
    model_path = os.path.join(models_dir, model_file)
    
    # Alternative path - check in maia_weights directory
    if not os.path.exists(model_path):
        models_dir = os.path.join(os.path.dirname(__file__), '..', 'maia_weights')
        model_path = os.path.join(models_dir, model_file)
    
    # Check if model file exists
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found for level {level}: {model_path}")
    
    try:
        # Load the TensorFlow model
        # Note: For .pb.gz files, we need to decompress and load
        import gzip
        
        # For now, we'll create a placeholder model structure
        # This will be replaced with actual TensorFlow model loading in the next phase
        model = _create_placeholder_model()
        
        # Cache the model
        _model_cache[level] = model
        
        return model
        
    except Exception as e:
        raise RuntimeError(f"Failed to load model for level {level}: {str(e)}")


def _create_placeholder_model():
    """
    Create a placeholder model for testing purposes.

    If TensorFlow is available we build a minimal tf.keras model, otherwise we
    return a lightweight Python class with a compatible `predict` method.
    This keeps the backend lightweight in environments where TensorFlow wheels
    are not available or are too heavy.
    """
    if _tf_available:
        # Build a minimal TensorFlow model
        inputs = tf.keras.Input(shape=(8, 8, 19), name='board_input')
        x = tf.keras.layers.Flatten()(inputs)
        x = tf.keras.layers.Dense(128, activation='relu')(x)
        outputs = tf.keras.layers.Dense(4096, activation='softmax', name='move_probabilities')(x)
        return tf.keras.Model(inputs=inputs, outputs=outputs)

    # Lightweight fallback model
    class _DummyModel:  # pylint: disable=too-few-public-methods
        """Replacement for tf.keras.Model with a `predict` method."""

        @staticmethod
        def predict(_features, verbose: int = 0):  # noqa: D401,N803, WPS110
            # Return a random probability distribution of shape (1, 4096)
            _ = verbose
            probs = np.random.random((1, 4096)).astype(np.float32)
            # Normalise to a probability distribution
            probs /= probs.sum(axis=1, keepdims=True)
            return probs

    return _DummyModel()


def fen_to_features(fen_string: str) -> np.ndarray:  # noqa: D401
    """Convert FEN -> model feature tensor.

    If the *real* converter is available (installed via the research
    `move_prediction` package) we use it. Otherwise we fall back to the old
    random tensor so the API still responds. The network expects shape
    ``(8, 8, 12)`` in *channels-last* order.
    """

    if callable(fenToVec):  # happy path – use real preprocessing
        try:
            features: np.ndarray = fenToVec(fen_string).astype(np.float32)
            # Original preprocessing outputs ``(C, H, W)``; transpose to
            # ``(H, W, C)`` expected by Keras placeholder model.
            if features.shape[0] == 19:  # 12 pieces + colour + 4 castles + ep?
                features = np.moveaxis(features, 0, -1)  # (H, W, C)
            return features
        except Exception:  # pragma: no cover – never crash API on preprocess
            pass

    # Fallback – keep server responsive.
    return np.random.random((8, 8, 12)).astype(np.float32)


def get_best_move(model, features, legal_moves):
    """
    Select the best legal move from the model's output probabilities.
    
    This is a placeholder function that will be replaced with the complex
    move selection logic from the original Maia project.
    
    Args:
        model (tf.keras.Model): The loaded Maia model
        features (np.ndarray): The position features tensor
        legal_moves (list): List of legal moves in UCI format
        
    Returns:
        str: The selected move in UCI format
    """
    # Placeholder implementation - returns a random legal move for now
    # This will be replaced with actual model prediction and move selection
    
    if not legal_moves:
        return None
    
    # Get model predictions (placeholder)
    predictions = model.predict(np.expand_dims(features, axis=0), verbose=0)
    
    # For now, just return a random legal move
    # In the actual implementation, this will map the model output probabilities
    # to specific moves and select the highest probability legal move
    import random
    return random.choice(legal_moves)


def predict_move(fen_string, level=1500):
    """
    Predict the best move for a given position using the specified Maia model.
    
    Args:
        fen_string (str): The FEN representation of the chess position
        level (int): The skill level of the model to use (default: 1500)
        
    Returns:
        str: The predicted move in UCI format
        
    Raises:
        FileNotFoundError: If the requested model level doesn't exist
        ValueError: If the FEN string is invalid or position has no legal moves
    """
    try:
        # Validate the FEN string and get legal moves
        board = chess.Board(fen_string)
        legal_moves = [move.uci() for move in board.legal_moves]
        
        if not legal_moves:
            raise ValueError("No legal moves available in the given position")
        
        # Load the model
        model = get_model(level)
        
        # Convert FEN to features
        features = fen_to_features(fen_string)
        
        # Get the best move
        best_move = get_best_move(model, features, legal_moves)
        
        return best_move
        
    except ValueError as ve:
        # This catches both chess parsing errors and our own ValueError
        if "Invalid FEN" in str(ve) or "invalid" in str(ve).lower():
            raise ValueError(f"Invalid FEN string: {fen_string}")
        else:
            raise ve