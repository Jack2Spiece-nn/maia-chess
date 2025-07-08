import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChessGame } from '../ChessGame';

// Mock all hooks
vi.mock('../../hooks/useChessGame', () => ({
  useChessGame: vi.fn(),
}));

vi.mock('../../hooks/useDeviceType', () => ({
  useDeviceType: vi.fn(),
}));

vi.mock('../../hooks/useSound', () => ({
  useChessSound: vi.fn(),
}));

vi.mock('../../hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: vi.fn(),
}));

vi.mock('../../hooks/useHapticFeedback', () => ({
  useHapticFeedback: vi.fn(),
}));

vi.mock('../../hooks/useValidation', () => ({
  useValidation: vi.fn(),
}));

// Mock components
vi.mock('../GameControls', () => ({
  GameControls: ({ onNewGame, onResign }: any) => (
    <div data-testid="game-controls">
      <button onClick={() => onNewGame('white', 1500)}>New Game</button>
      <button onClick={onResign}>Resign</button>
    </div>
  ),
}));

vi.mock('../GameStatus', () => ({
  GameStatus: ({ gameState }: any) => (
    <div data-testid="game-status">{gameState.gameStatus}</div>
  ),
}));

vi.mock('../MoveHistory', () => ({
  MoveHistory: () => <div data-testid="move-history">Move History</div>,
}));

vi.mock('../AiSettings', () => ({
  AiSettings: () => <div data-testid="ai-settings">AI Settings</div>,
}));

vi.mock('../SoundSettings', () => ({
  SoundSettings: () => <div data-testid="sound-settings">Sound Settings</div>,
}));

vi.mock('../LoadingState', () => ({
  LoadingState: () => <div data-testid="loading-state">Thinking...</div>,
}));

// Mock react-chessboard
vi.mock('react-chessboard', () => ({
  Chessboard: ({ onPieceDrop, onSquareClick, position }: any) => (
    <div 
      data-testid="chessboard" 
      data-position={position}
      onClick={(e) => {
        const square = (e.target as HTMLElement)?.getAttribute('data-square');
        if (square) onSquareClick(square);
      }}
      onDrop={(e) => {
        const from = e.dataTransfer?.getData('from');
        const to = (e.target as HTMLElement)?.getAttribute('data-square');
        if (from && to) onPieceDrop(from, to);
      }}
    >
      <div data-square="e2" onClick={() => onSquareClick('e2')}>e2</div>
      <div data-square="e4" onClick={() => onSquareClick('e4')}>e4</div>
    </div>
  ),
}));

import { useChessGame } from '../../hooks/useChessGame';
import { useDeviceType } from '../../hooks/useDeviceType';
import { useChessSound } from '../../hooks/useSound';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useValidation } from '../../hooks/useValidation';

const mockUseChessGame = useChessGame as any;
const mockUseDeviceType = useDeviceType as any;
const mockUseChessSound = useChessSound as any;
const mockUsePerformanceMonitor = usePerformanceMonitor as any;
const mockUseHapticFeedback = useHapticFeedback as any;
const mockUseValidation = useValidation as any;

describe('ChessGame', () => {
  const mockGameState = {
    chess: {
      fen: () => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      turn: () => 'w',
      get: vi.fn().mockReturnValue(null),
      isCheckmate: () => false,
      isCheck: () => false,
      moves: vi.fn().mockReturnValue([]),
    },
    gameStatus: 'waiting' as const,
    isPlayerTurn: true,
    isThinking: false,
    playerColor: 'white' as const,
    aiLevel: 1500,
    aiNodes: 1,
    moveHistory: [],
    isGameOver: false,
    winner: null,
    gameResult: null,
  };

  const mockHooks = {
    useChessGame: {
      gameState: mockGameState,
      error: null,
      makeMove: vi.fn(),
      startNewGame: vi.fn(),
      resignGame: vi.fn(),
      setAiLevel: vi.fn(),
      setAiNodes: vi.fn(),
      clearError: vi.fn(),
    },
    useDeviceType: {
      isMobile: false,
      isTablet: false,
      isTouch: false,
      orientation: 'landscape' as const,
    },
    useChessSound: {
      playSound: vi.fn(),
    },
    usePerformanceMonitor: {
      metrics: {
        renderFPS: 60,
        lastMoveTime: 100,
        touchLatency: 50,
        networkStatus: 'online' as const,
        apiResponseTime: 100,
      },
      trackApiCall: vi.fn(),
      measureTouchLatency: vi.fn(),
      startMonitoring: vi.fn(),
      isMonitoring: false,
    },
    useHapticFeedback: {
      pieceMove: vi.fn(),
      pieceCapture: vi.fn(),
      pieceSelect: vi.fn(),
      check: vi.fn(),
      checkmate: vi.fn(),
      gameStart: vi.fn(),
      gameEnd: vi.fn(),
      error: vi.fn(),
    },
    useValidation: {
      logAIBehaviorFeedback: vi.fn(),
      logConnectionQuality: vi.fn(),
      logGameSession: vi.fn(),
    },
  };

  beforeEach(() => {
    mockUseChessGame.mockReturnValue(mockHooks.useChessGame);
    mockUseDeviceType.mockReturnValue(mockHooks.useDeviceType);
    mockUseChessSound.mockReturnValue(mockHooks.useChessSound);
    mockUsePerformanceMonitor.mockReturnValue(mockHooks.usePerformanceMonitor);
    mockUseHapticFeedback.mockReturnValue(mockHooks.useHapticFeedback);
    mockUseValidation.mockReturnValue(mockHooks.useValidation);
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders chess board', () => {
    render(<ChessGame />);
    expect(screen.getByTestId('chessboard')).toBeInTheDocument();
  });

  it('renders game status', () => {
    render(<ChessGame />);
    expect(screen.getByTestId('game-status')).toBeInTheDocument();
    expect(screen.getByText('waiting')).toBeInTheDocument();
  });

  it('renders game controls', () => {
    render(<ChessGame />);
    expect(screen.getByTestId('game-controls')).toBeInTheDocument();
    expect(screen.getByText('New Game')).toBeInTheDocument();
  });

  it('renders AI settings', () => {
    render(<ChessGame />);
    expect(screen.getByTestId('ai-settings')).toBeInTheDocument();
  });

  it('renders move history', () => {
    render(<ChessGame />);
    expect(screen.getByTestId('move-history')).toBeInTheDocument();
  });

  it('handles board flip', () => {
    render(<ChessGame />);
    const flipButton = screen.getByText('↓ Flip to Black');
    fireEvent.click(flipButton);
    expect(screen.getByText('↑ Flip to White')).toBeInTheDocument();
  });

  it('shows loading state when AI is thinking', () => {
    mockUseChessGame.mockReturnValue({
      ...mockHooks.useChessGame,
      gameState: { ...mockGameState, isThinking: true },
    });

    render(<ChessGame />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  it('displays error message when present', () => {
    mockUseChessGame.mockReturnValue({
      ...mockHooks.useChessGame,
      error: 'Test error message',
    });

    render(<ChessGame />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('handles new game creation', () => {
    const mockStartNewGame = vi.fn();
    mockUseChessGame.mockReturnValue({
      ...mockHooks.useChessGame,
      startNewGame: mockStartNewGame,
    });

    render(<ChessGame />);
    const newGameButton = screen.getByText('New Game');
    fireEvent.click(newGameButton);

    expect(mockStartNewGame).toHaveBeenCalledWith('white', 1500);
  });

  it('handles game resignation', () => {
    const mockResignGame = vi.fn();
    mockUseChessGame.mockReturnValue({
      ...mockHooks.useChessGame,
      resignGame: mockResignGame,
    });

    render(<ChessGame />);
    const resignButton = screen.getByText('Resign');
    fireEvent.click(resignButton);

    expect(mockResignGame).toHaveBeenCalled();
  });

  it('renders mobile layout when on mobile device', () => {
    mockUseDeviceType.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isTouch: true,
      orientation: 'portrait' as const,
    });

    render(<ChessGame />);
    // Check for mobile-specific classes or layout
    expect(screen.getByTestId('chessboard')).toBeInTheDocument();
  });

  it('shows performance metrics on mobile', () => {
    mockUseDeviceType.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isTouch: true,
      orientation: 'portrait' as const,
    });

    render(<ChessGame />);
    // The mobile performance indicator should be present
    const performanceIndicator = screen.getByText('●');
    expect(performanceIndicator).toBeInTheDocument();
  });

  it('handles square clicks for move selection', () => {
    const mockMakeMove = vi.fn().mockReturnValue(true);
    mockUseChessGame.mockReturnValue({
      ...mockHooks.useChessGame,
      gameState: { ...mockGameState, gameStatus: 'playing' },
      makeMove: mockMakeMove,
    });

    render(<ChessGame />);
    
    // Simulate square click
    const e2Square = screen.getByText('e2');
    fireEvent.click(e2Square);
    
    const e4Square = screen.getByText('e4');
    fireEvent.click(e4Square);

    expect(mockMakeMove).toHaveBeenCalled();
  });

  it('shows offline notification when network is offline', () => {
    mockUsePerformanceMonitor.mockReturnValue({
      ...mockHooks.usePerformanceMonitor,
      metrics: {
        ...mockHooks.usePerformanceMonitor.metrics,
        networkStatus: 'offline',
      },
    });

    render(<ChessGame />);
    expect(screen.getByText("You're offline. Some features may not work.")).toBeInTheDocument();
  });
});