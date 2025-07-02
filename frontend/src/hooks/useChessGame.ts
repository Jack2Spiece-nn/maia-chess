import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { GameState, GameStatus, PlayerColor } from '../types/game';
import { apiService } from '../services/api';

export const useChessGame = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    chess: new Chess(),
    gameStatus: 'waiting',
    playerColor: 'white',
    aiLevel: 1500,
    isPlayerTurn: true,
    isThinking: false,
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    lastMove: null,
  }));

  const [error, setError] = useState<string | null>(null);

  const updateGameStatus = useCallback((chess: Chess): GameStatus => {
    if (chess.isCheckmate()) return 'checkmate';
    if (chess.isStalemate()) return 'stalemate';
    if (chess.isDraw()) return 'draw';
    return 'playing';
  }, []);

  const getCapturedPieces = useCallback((chess: Chess) => {
    const history = chess.history({ verbose: true });
    const captured = { white: [], black: [] };
    
    history.forEach(move => {
      if (move.captured) {
        const piece = move.captured;
        const color = move.color === 'w' ? 'black' : 'white';
        captured[color].push(piece);
      }
    });
    
    return captured;
  }, []);

  const makeMove = useCallback(async (from: string, to: string, promotion?: string) => {
    const chess = new Chess(gameState.chess.fen());
    
    try {
      const move = chess.move({
        from,
        to,
        promotion: promotion || 'q',
      });

      if (!move) {
        setError('Invalid move');
        return false;
      }

      const newStatus = updateGameStatus(chess);
      const capturedPieces = getCapturedPieces(chess);

      setGameState(prev => ({
        ...prev,
        chess,
        gameStatus: newStatus,
        isPlayerTurn: false,
        moveHistory: [...prev.moveHistory, move.san],
        capturedPieces,
        lastMove: { from, to },
      }));

      setError(null);

      // If game is not over and it's AI's turn, request AI move
      if (newStatus === 'playing') {
        setTimeout(() => requestAiMove(chess), 500); // Small delay for better UX
      }

      return true;
    } catch (err) {
      setError('Invalid move');
      return false;
    }
  }, [gameState.chess, updateGameStatus, getCapturedPieces]);

  const requestAiMove = useCallback(async (chess: Chess) => {
    setGameState(prev => ({ ...prev, isThinking: true }));
    setError(null);

    try {
      const response = await apiService.getMove(chess.fen(), gameState.aiLevel);
      
      // Verify the move is valid
      const aiChess = new Chess(chess.fen());
      const aiMove = aiChess.move(response.move);
      
      if (!aiMove) {
        throw new Error('AI returned invalid move');
      }

      const newStatus = updateGameStatus(aiChess);
      const capturedPieces = getCapturedPieces(aiChess);

      setGameState(prev => ({
        ...prev,
        chess: aiChess,
        gameStatus: newStatus,
        isPlayerTurn: true,
        isThinking: false,
        moveHistory: [...prev.moveHistory, aiMove.san],
        capturedPieces,
        lastMove: { from: aiMove.from, to: aiMove.to },
      }));

    } catch (err) {
      console.error('AI move error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get AI move');
      setGameState(prev => ({
        ...prev,
        isThinking: false,
        isPlayerTurn: true,
      }));
    }
  }, [gameState.aiLevel, updateGameStatus, getCapturedPieces]);

  const startNewGame = useCallback((playerColor: PlayerColor = 'white', aiLevel: number = 1500) => {
    const chess = new Chess();
    
    setGameState({
      chess,
      gameStatus: 'playing',
      playerColor,
      aiLevel,
      isPlayerTurn: playerColor === 'white',
      isThinking: false,
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      lastMove: null,
    });
    
    setError(null);

    // If player chose black, AI makes first move
    if (playerColor === 'black') {
      setTimeout(() => requestAiMove(chess), 500);
    }
  }, [requestAiMove]);

  const resignGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'resigned',
      isPlayerTurn: false,
      isThinking: false,
    }));
  }, []);

  const setAiLevel = useCallback((level: number) => {
    setGameState(prev => ({ ...prev, aiLevel: level }));
  }, []);

  return {
    gameState,
    error,
    makeMove,
    startNewGame,
    resignGame,
    setAiLevel,
    clearError: () => setError(null),
  };
};