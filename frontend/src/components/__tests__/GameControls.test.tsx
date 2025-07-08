import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameControls } from '../GameControls';

describe('GameControls', () => {
  const mockGameState = {
    chess: {
      fen: () => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      turn: () => 'w',
      get: () => null,
      isCheckmate: () => false,
      isCheck: () => false,
      moves: () => [],
    },
    gameStatus: 'waiting' as const,
    isPlayerTurn: true,
    isThinking: false,
    playerColor: 'white' as const,
    aiLevel: 1500,
    aiNodes: 1,
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    lastMove: null,
    isGameOver: false,
    winner: null,
    gameResult: null,
  };

  const mockProps = {
    gameState: mockGameState,
    onNewGame: vi.fn(),
    onResign: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders new game button when game is waiting', () => {
    render(<GameControls {...mockProps} />);
    expect(screen.getByText('New Game')).toBeInTheDocument();
  });

  it('shows color selection when new game is clicked', () => {
    render(<GameControls {...mockProps} />);
    const newGameButton = screen.getByText('New Game');
    fireEvent.click(newGameButton);
    
    expect(screen.getByText('Play as White')).toBeInTheDocument();
    expect(screen.getByText('Play as Black')).toBeInTheDocument();
  });

  it('calls onNewGame when white is selected', () => {
    render(<GameControls {...mockProps} />);
    const newGameButton = screen.getByText('New Game');
    fireEvent.click(newGameButton);
    
    const whiteButton = screen.getByText('Play as White');
    fireEvent.click(whiteButton);
    
    expect(mockProps.onNewGame).toHaveBeenCalledWith('white', 1500);
  });

  it('calls onNewGame when black is selected', () => {
    render(<GameControls {...mockProps} />);
    const newGameButton = screen.getByText('New Game');
    fireEvent.click(newGameButton);
    
    const blackButton = screen.getByText('Play as Black');
    fireEvent.click(blackButton);
    
    expect(mockProps.onNewGame).toHaveBeenCalledWith('black', 1500);
  });

  it('renders resign button when game is playing', () => {
    const playingGameState = {
      ...mockGameState,
      gameStatus: 'playing' as const,
    };

    render(<GameControls {...mockProps} gameState={playingGameState} />);
    expect(screen.getByText('Resign')).toBeInTheDocument();
  });

  it('calls onResign when resign button is clicked', () => {
    const playingGameState = {
      ...mockGameState,
      gameStatus: 'playing' as const,
    };

    render(<GameControls {...mockProps} gameState={playingGameState} />);
    const resignButton = screen.getByText('Resign');
    fireEvent.click(resignButton);
    
    expect(mockProps.onResign).toHaveBeenCalled();
  });

  it('shows game over message when game is finished by checkmate', () => {
    const finishedGameState = {
      ...mockGameState,
      gameStatus: 'checkmate' as const,
      isGameOver: true,
      winner: 'white' as const,
    };

    render(<GameControls {...mockProps} gameState={finishedGameState} />);
    expect(screen.getByText(/checkmate/i)).toBeInTheDocument();
  });

  it('shows stalemate message when game ends in stalemate', () => {
    const stalemateGameState = {
      ...mockGameState,
      gameStatus: 'stalemate' as const,
      isGameOver: true,
    };

    render(<GameControls {...mockProps} gameState={stalemateGameState} />);
    expect(screen.getByText(/stalemate/i)).toBeInTheDocument();
  });

  it('shows resignation message when game is resigned', () => {
    const resignedGameState = {
      ...mockGameState,
      gameStatus: 'resigned' as const,
      isGameOver: true,
      winner: 'black' as const,
    };

    render(<GameControls {...mockProps} gameState={resignedGameState} />);
    expect(screen.getByText(/resigned/i)).toBeInTheDocument();
  });

  it('disables resign button when AI is thinking', () => {
    const thinkingGameState = {
      ...mockGameState,
      gameStatus: 'playing' as const,
      isThinking: true,
    };

    render(<GameControls {...mockProps} gameState={thinkingGameState} />);
    const resignButton = screen.getByText('Resign');
    expect(resignButton).toBeDisabled();
  });

  it('allows starting new game after game is finished', () => {
    const finishedGameState = {
      ...mockGameState,
      gameStatus: 'checkmate' as const,
      isGameOver: true,
      winner: 'white' as const,
    };

    render(<GameControls {...mockProps} gameState={finishedGameState} />);
    expect(screen.getByText('New Game')).toBeInTheDocument();
  });

  it('cancels color selection when cancel is clicked', () => {
    render(<GameControls {...mockProps} />);
    const newGameButton = screen.getByText('New Game');
    fireEvent.click(newGameButton);
    
    expect(screen.getByText('Play as White')).toBeInTheDocument();
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByText('Play as White')).not.toBeInTheDocument();
    expect(screen.getByText('New Game')).toBeInTheDocument();
  });

  it('shows current AI level in color selection', () => {
    const aiLevelGameState = {
      ...mockGameState,
      aiLevel: 1800,
    };

    render(<GameControls {...mockProps} gameState={aiLevelGameState} />);
    const newGameButton = screen.getByText('New Game');
    fireEvent.click(newGameButton);
    
    expect(screen.getByText(/1800/)).toBeInTheDocument();
  });

  it('uses current AI level when starting game', () => {
    const aiLevelGameState = {
      ...mockGameState,
      aiLevel: 1600,
    };

    render(<GameControls {...mockProps} gameState={aiLevelGameState} />);
    const newGameButton = screen.getByText('New Game');
    fireEvent.click(newGameButton);
    
    const whiteButton = screen.getByText('Play as White');
    fireEvent.click(whiteButton);
    
    expect(mockProps.onNewGame).toHaveBeenCalledWith('white', 1600);
  });

  it('shows correct winner message for white victory', () => {
    const whiteWinGameState = {
      ...mockGameState,
      gameStatus: 'checkmate' as const,
      isGameOver: true,
      winner: 'white' as const,
    };

    render(<GameControls {...mockProps} gameState={whiteWinGameState} />);
    expect(screen.getByText(/white wins/i)).toBeInTheDocument();
  });

  it('shows correct winner message for black victory', () => {
    const blackWinGameState = {
      ...mockGameState,
      gameStatus: 'checkmate' as const,
      isGameOver: true,
      winner: 'black' as const,
    };

    render(<GameControls {...mockProps} gameState={blackWinGameState} />);
    expect(screen.getByText(/black wins/i)).toBeInTheDocument();
  });
});