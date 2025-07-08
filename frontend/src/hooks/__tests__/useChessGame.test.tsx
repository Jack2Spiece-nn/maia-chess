import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useChessGame } from '../useChessGame';

// Mock the API module
vi.mock('../../services/api', () => ({
  apiService: {
    getMove: vi.fn(),
  },
}));

// Mock Chess.js
const mockChess = {
  fen: vi.fn(() => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
  turn: vi.fn(() => 'w'),
  move: vi.fn(),
  moves: vi.fn(() => []),
  isCheckmate: vi.fn(() => false),
  isCheck: vi.fn(() => false),
  isStalemate: vi.fn(() => false),
  isDraw: vi.fn(() => false),
  reset: vi.fn(),
  get: vi.fn(() => null),
  history: vi.fn(() => []),
};

vi.mock('chess.js', () => ({
  Chess: vi.fn(() => mockChess),
}));

import { apiService } from '../../services/api';

const mockApiService = apiService as any;

describe('useChessGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiService.getMove.mockResolvedValue({ 
      move: 'e7e5', 
      level: 1500, 
      nodes: 1 
    });
    
    // Reset mock chess state
    mockChess.fen.mockReturnValue('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    mockChess.turn.mockReturnValue('w');
    mockChess.move.mockReturnValue(true);
    mockChess.isCheckmate.mockReturnValue(false);
    mockChess.isCheck.mockReturnValue(false);
    mockChess.isStalemate.mockReturnValue(false);
    mockChess.isDraw.mockReturnValue(false);
    mockChess.get.mockReturnValue(null);
    mockChess.history.mockReturnValue([]);
    mockChess.moves.mockReturnValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useChessGame());
    
    expect(result.current.gameState.gameStatus).toBe('waiting');
    expect(result.current.gameState.isPlayerTurn).toBe(true);
    expect(result.current.gameState.aiLevel).toBe(1500);
    expect(result.current.gameState.aiNodes).toBe(1);
    expect(result.current.gameState.playerColor).toBe('white');
    expect(result.current.error).toBe(null);
  });

  it('starts new game correctly', async () => {
    const { result } = renderHook(() => useChessGame());
    
    await act(async () => {
      result.current.startNewGame('white', 1800);
    });
    
    expect(result.current.gameState.gameStatus).toBe('playing');
    expect(result.current.gameState.playerColor).toBe('white');
    expect(result.current.gameState.aiLevel).toBe(1800);
    expect(result.current.gameState.moveHistory).toHaveLength(0);
    expect(mockChess.reset).toHaveBeenCalled();
  });

  it('handles player move correctly', async () => {
    const { result } = renderHook(() => useChessGame());
    
    // Start a game first
    await act(async () => {
      result.current.startNewGame('white', 1500);
    });
    
    // Mock successful move
    mockChess.move.mockReturnValue({ san: 'e4', from: 'e2', to: 'e4' });
    mockChess.turn.mockReturnValue('b'); // After move, it's black's turn
    
    await act(async () => {
      const success = result.current.makeMove('e2', 'e4');
      expect(success).toBe(true);
    });
    
    expect(result.current.gameState.isPlayerTurn).toBe(false);
    expect(result.current.gameState.isThinking).toBe(true);
    expect(mockChess.move).toHaveBeenCalledWith({ from: 'e2', to: 'e4' });
  });

  it('handles invalid moves', async () => {
    const { result } = renderHook(() => useChessGame());
    
    await act(async () => {
      result.current.startNewGame('white', 1500);
    });
    
    // Mock invalid move
    mockChess.move.mockReturnValue(null);
    
    await act(async () => {
      const success = result.current.makeMove('e2', 'e5'); // Invalid move
      expect(success).toBe(false);
    });
    
    expect(result.current.gameState.moveHistory).toHaveLength(0);
  });

  it('handles AI move correctly', async () => {
    const { result } = renderHook(() => useChessGame());
    
    await act(async () => {
      result.current.startNewGame('white', 1500);
    });
    
    // Make a player move to trigger AI
    mockChess.move.mockReturnValue({ san: 'e4', from: 'e2', to: 'e4' });
    mockChess.turn.mockReturnValue('b');
    
    await act(async () => {
      result.current.makeMove('e2', 'e4');
    });
    
    // Wait for AI response
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(mockApiService.getMove).toHaveBeenCalled();
  });

  it('handles game resignation', async () => {
    const { result } = renderHook(() => useChessGame());
    
    await act(async () => {
      result.current.startNewGame('white', 1500);
    });
    
    await act(async () => {
      result.current.resignGame();
    });
    
    expect(result.current.gameState.gameStatus).toBe('resigned');
    expect(result.current.gameState.winner).toBe('black');
    expect(result.current.gameState.isGameOver).toBe(true);
  });

  it('handles AI level change', async () => {
    const { result } = renderHook(() => useChessGame());
    
    await act(async () => {
      result.current.setAiLevel(1800);
    });
    
    expect(result.current.gameState.aiLevel).toBe(1800);
  });

  it('handles AI nodes change', async () => {
    const { result } = renderHook(() => useChessGame());
    
    await act(async () => {
      result.current.setAiNodes(10);
    });
    
    expect(result.current.gameState.aiNodes).toBe(10);
  });

  it('handles checkmate detection', async () => {
    const { result } = renderHook(() => useChessGame());
    
    await act(async () => {
      result.current.startNewGame('white', 1500);
    });
    
    // Mock checkmate situation
    mockChess.isCheckmate.mockReturnValue(true);
    mockChess.turn.mockReturnValue('b'); // Black is checkmated
    mockChess.move.mockReturnValue({ san: 'Qh5#', from: 'd1', to: 'h5' });
    
    await act(async () => {
      result.current.makeMove('d1', 'h5');
    });
    
    // Wait for state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    expect(result.current.gameState.gameStatus).toBe('checkmate');
    expect(result.current.gameState.winner).toBe('white');
    expect(result.current.gameState.isGameOver).toBe(true);
  });

  it('handles API errors gracefully', async () => {
    const { result } = renderHook(() => useChessGame());
    
    // Mock API error
    mockApiService.getMove.mockRejectedValue(new Error('API Error'));
    
    await act(async () => {
      result.current.startNewGame('white', 1500);
    });
    
    // Make player move to trigger AI
    mockChess.move.mockReturnValue({ san: 'e4', from: 'e2', to: 'e4' });
    mockChess.turn.mockReturnValue('b');
    
    await act(async () => {
      result.current.makeMove('e2', 'e4');
    });
    
    // Wait for error handling
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.error).toBeTruthy();
    expect(result.current.gameState.isThinking).toBe(false);
  });

  it('clears error correctly', async () => {
    const { result } = renderHook(() => useChessGame());
    
    // Set an error state by triggering API error
    mockApiService.getMove.mockRejectedValue(new Error('API Error'));
    
    await act(async () => {
      result.current.startNewGame('white', 1500);
    });
    
    await act(async () => {
      result.current.makeMove('e2', 'e4');
    });
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.error).toBeTruthy();
    
    await act(async () => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBe(null);
  });

  it('handles stalemate detection', async () => {
    const { result } = renderHook(() => useChessGame());
    
    await act(async () => {
      result.current.startNewGame('white', 1500);
    });
    
    // Mock stalemate situation
    mockChess.isStalemate.mockReturnValue(true);
    mockChess.move.mockReturnValue({ san: 'Kh1', from: 'g1', to: 'h1' });
    
    await act(async () => {
      result.current.makeMove('g1', 'h1');
    });
    
    // Wait for state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    expect(result.current.gameState.gameStatus).toBe('stalemate');
    expect(result.current.gameState.isGameOver).toBe(true);
  });

  it('updates move history correctly', async () => {
    const { result } = renderHook(() => useChessGame());
    
    await act(async () => {
      result.current.startNewGame('white', 1500);
    });
    
    // Mock move history
    mockChess.history.mockReturnValue(['e4', 'e5']);
    mockChess.move.mockReturnValue({ san: 'e4', from: 'e2', to: 'e4' });
    
    await act(async () => {
      result.current.makeMove('e2', 'e4');
    });
    
    expect(result.current.gameState.moveHistory).toEqual(['e4', 'e5']);
  });
});