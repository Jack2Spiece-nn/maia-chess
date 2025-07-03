import { Chess } from 'chess.js';

export type GameStatus = 'waiting' | 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';

export type PlayerColor = 'white' | 'black';

export interface GameState {
  chess: Chess;
  gameStatus: GameStatus;
  playerColor: PlayerColor;
  aiLevel: number;
  aiNodes: number;
  isPlayerTurn: boolean;
  isThinking: boolean;
  moveHistory: string[];
  capturedPieces: {
    white: string[];
    black: string[];
  };
  lastMove: {
    from: string;
    to: string;
  } | null;
}

export interface MoveHistoryItem {
  move: string;
  san: string;
  fen: string;
  timestamp: number;
}

export const AI_LEVELS = [
  { value: 1100, label: 'Beginner (1100)', description: 'Makes basic moves, good for learning' },
  { value: 1200, label: 'Casual (1200)', description: 'Plays like a casual player' },
  { value: 1300, label: 'Club (1300)', description: 'Club-level play with some tactics' },
  { value: 1400, label: 'Intermediate (1400)', description: 'Solid intermediate play' },
  { value: 1500, label: 'Advanced (1500)', description: 'Strong tactical awareness' },
  { value: 1600, label: 'Expert (1600)', description: 'Expert-level strategic play' },
  { value: 1700, label: 'Master (1700)', description: 'Master-level precision' },
  { value: 1800, label: 'Strong Master (1800)', description: 'Very strong play' },
  { value: 1900, label: 'Elite (1900)', description: 'Elite-level performance' },
] as const;

export type AiLevel = typeof AI_LEVELS[number]['value'];

export const NODES_OPTIONS = [
  { value: 1, label: '1 Node (Fastest)', description: 'Original Maia speed, very fast' },
  { value: 10, label: '10 Nodes (Fast)', description: 'Slightly stronger, still fast' },
  { value: 50, label: '50 Nodes (Balanced)', description: 'Good balance of speed and strength' },
  { value: 100, label: '100 Nodes (Strong)', description: 'Stronger play, slower analysis' },
  { value: 500, label: '500 Nodes (Very Strong)', description: 'Very strong play, notable delay' },
  { value: 1000, label: '1000 Nodes (Maximum)', description: 'Maximum strength, slowest' },
] as const;

export type NodesOption = typeof NODES_OPTIONS[number]['value'];