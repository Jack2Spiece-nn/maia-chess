import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { GameState, GameStatus, PlayerColor } from '../types/game';
import { maiaApi } from '../services/api';
import { usePerformanceMonitor } from './usePerformanceMonitor';

export const useChessGame = () => {
  const { trackApiCall } = usePerformanceMonitor();
  
  const [gameState, setGameState] = useState<GameState>(() => ({
    chess: new Chess(),
    gameStatus: 'waiting',
    playerColor: 'white',
    aiLevel: 1500, // This now stores the actual rating
    aiNodes: 1, // Default to 1 node for original Maia behavior
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
    const captured: { white: string[], black: string[] } = { white: [], black: [] };
    
    history.forEach(move => {
      if (move.captured) {
        const piece = move.captured;
        const color = move.color === 'w' ? 'black' : 'white';
        captured[color].push(piece);
      }
    });
    
    return captured;
  }, []);

  const makeMove = useCallback((from: string, to: string, promotion?: string) => {
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
      // Track API call performance
      const response = await trackApiCall(
        maiaApi.getMove({
          fen: chess.fen(),
          level: gameState.aiLevel,
          nodes: gameState.aiNodes
        }),
        'move'
      );
      
      // Check if response contains an error
      if (!response || !response.move) {
        throw new Error(`AI failed to generate move: ${response ? JSON.stringify(response) : 'No response'}`);
      }
      
      // Log engine type for validation if available
      if ((response as any).engine_type) {
        console.log(`[VALIDATION] ENGINE_TYPE_RECEIVED: ${(response as any).engine_type}`);
      }
      
      // Verify the move is valid
      const aiChess = new Chess(chess.fen());
      const aiMove = aiChess.move(response.move);
      
      if (!aiMove) {
        throw new Error(`AI returned invalid move: ${response.move}`);
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

      console.log(`[Game] AI move completed: ${aiMove.san}, Level: ${gameState.aiLevel}, Nodes: ${gameState.aiNodes}`);

    } catch (err) {
      console.error('AI move error:', err);
      let errorMessage = 'Maia is having trouble finding a move. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('404')) {
          errorMessage = 'This AI level is temporarily unavailable. Try selecting a different level.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Maia is taking too long to respond. Please try again.';
        } else {
          errorMessage = err.message;
        }
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        // Axios error with response
        const axiosErr = err as any;
        if (axiosErr.response?.status === 404) {
          errorMessage = 'This AI level is temporarily unavailable. Try selecting a different level.';
        } else if (axiosErr.response?.data?.error) {
          errorMessage = `Maia encountered an issue: ${axiosErr.response.data.error}`;
        } else {
          errorMessage = `Connection issue: ${axiosErr.message || 'Please check your internet connection'}`;
        }
      }
      
      setError(errorMessage);
      setGameState(prev => ({
        ...prev,
        isThinking: false,
        isPlayerTurn: true,
      }));
    }
  }, [gameState.aiLevel, gameState.aiNodes, updateGameStatus, getCapturedPieces, trackApiCall]);

  const startNewGame = useCallback((playerColor: PlayerColor = 'white', aiRating: number = 1500) => {
    const chess = new Chess();
    
    setGameState(prev => ({
      chess,
      gameStatus: 'playing',
      playerColor,
      aiLevel: aiRating, // Store the actual rating
      aiNodes: prev.aiNodes, // Preserve current nodes setting
      isPlayerTurn: playerColor === 'white',
      isThinking: false,
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      lastMove: null,
    }));
    
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

  const setAiLevel = useCallback((rating: number) => {
    setGameState(prev => ({ ...prev, aiLevel: rating })); // Store the actual rating
  }, []);

  const setAiNodes = useCallback((nodes: number) => {
    setGameState(prev => ({ ...prev, aiNodes: nodes }));
  }, []);

  return {
    gameState,
    error,
    makeMove,
    startNewGame,
    resignGame,
    setAiLevel,
    setAiNodes,
    clearError: () => setError(null),
  };
};