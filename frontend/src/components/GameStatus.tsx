import React from 'react';
import { GameState } from '../types/game';
import { Trophy, Clock, AlertCircle, Crown, User } from 'lucide-react';

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
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'playing':
        return gameState.isPlayerTurn ? 
          <User className="w-5 h-5 text-blue-400" /> : 
          <Crown className="w-5 h-5 text-purple-400" />;
      case 'stalemate':
      case 'draw':
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (gameState.gameStatus) {
      case 'checkmate':
        return 'text-yellow-400';
      case 'playing':
        return gameState.isPlayerTurn ? 'text-blue-400' : 'text-purple-400';
      case 'stalemate':
      case 'draw':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg p-4 border border-slate-600/50">
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div>
          <h3 className={`font-semibold ${getStatusColor()}`}>
            {getStatusMessage()}
          </h3>
          <p className="text-sm text-gray-400">
            Playing as {gameState.playerColor} vs Maia {gameState.aiLevel}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-sm text-gray-400">Move {Math.ceil(gameState.moveHistory.length / 2)}</div>
        {gameState.chess.inCheck() && (
          <div className="text-red-400 text-sm font-medium flex items-center space-x-1 mt-1">
            <AlertCircle className="w-4 h-4" />
            <span>Check!</span>
          </div>
        )}
      </div>
    </div>
  );
};