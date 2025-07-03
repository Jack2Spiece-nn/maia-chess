import React from 'react';
import { GameState } from '../types/game';
import { Trophy, Clock, AlertCircle, User, Bot } from 'lucide-react';
import { getLevelFromRating } from './AiSettings';

interface GameStatusProps {
  gameState: GameState;
}

export const GameStatus: React.FC<GameStatusProps> = ({ gameState }) => {
  const getStatusMessage = () => {
    switch (gameState.gameStatus) {
      case 'waiting':
        return 'Ready to play';
      case 'playing':
        if (gameState.isThinking) {
          return 'Maia is thinking...';
        }
        return gameState.isPlayerTurn ? 'Your turn' : "Maia's turn";
      case 'checkmate':
        const winner = gameState.chess.turn() === 'w' ? 'Black' : 'White';
        return `Checkmate! ${winner} wins`;
      case 'stalemate':
        return 'Stalemate - Draw!';
      case 'draw':
        return 'Draw!';
      case 'resigned':
        return 'Game resigned';
      default:
        return 'Game over';
    }
  };

  const getStatusIcon = () => {
    switch (gameState.gameStatus) {
      case 'checkmate':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'playing':
        return gameState.isPlayerTurn ? 
          <User className="w-5 h-5 text-blue-500" /> : 
          <Bot className="w-5 h-5 text-purple-500 animate-pulse" />;
      case 'stalemate':
      case 'draw':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (gameState.gameStatus) {
      case 'checkmate':
        return 'text-yellow-600';
      case 'playing':
        return gameState.isPlayerTurn ? 'text-blue-600' : 'text-purple-600';
      case 'stalemate':
      case 'draw':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100 shadow-sm">
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div>
          <h3 className={`font-bold ${getStatusColor()}`}>
            {getStatusMessage()}
          </h3>
          <p className="text-sm text-gray-600">
            Playing as <span className="font-medium capitalize">{gameState.playerColor}</span> vs <span className="font-medium">Maia Level {getLevelFromRating(gameState.aiLevel)} ({gameState.aiLevel})</span>
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-sm text-gray-600 font-medium">Move {Math.ceil(gameState.moveHistory.length / 2)}</div>
        {gameState.chess.inCheck() && (
          <div className="text-red-500 text-sm font-bold flex items-center space-x-1 mt-1">
            <AlertCircle className="w-4 h-4" />
            <span>Check!</span>
          </div>
        )}
      </div>
    </div>
  );
};