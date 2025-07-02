import React, { useState } from 'react';
import { GameState, PlayerColor } from '../types/game';
import { Play, Square, Flag, RotateCcw, Palette } from 'lucide-react';
import { clsx } from 'clsx';

interface GameControlsProps {
  gameState: GameState;
  onNewGame: (playerColor: PlayerColor, aiLevel: number) => void;
  onResign: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onNewGame,
  onResign,
}) => {
  const [showNewGameOptions, setShowNewGameOptions] = useState(false);

  const handleNewGame = (color: PlayerColor) => {
    onNewGame(color, gameState.aiLevel);
    setShowNewGameOptions(false);
  };

  const canResign = gameState.gameStatus === 'playing' && !gameState.isThinking;

  return (
    <div className="game-panel space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
        <Square className="w-5 h-5" />
        <span>Game Controls</span>
      </h3>

      {!showNewGameOptions ? (
        <div className="space-y-3">
          <button
            onClick={() => setShowNewGameOptions(true)}
            className="button-primary w-full flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>New Game</span>
          </button>

          <button
            onClick={onResign}
            disabled={!canResign}
            className={clsx(
              'w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-all duration-200',
              canResign
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                : 'bg-gray-500/20 text-gray-500 border border-gray-500/30 cursor-not-allowed'
            )}
          >
            <Flag className="w-4 h-4" />
            <span>Resign</span>
          </button>

          {gameState.gameStatus !== 'waiting' && gameState.gameStatus !== 'playing' && (
            <div className="text-center pt-2">
              <p className="text-sm text-gray-400">Game ended</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-white flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Choose Your Color</span>
            </h4>
            <button
              onClick={() => setShowNewGameOptions(false)}
              className="text-gray-400 hover:text-white text-sm"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleNewGame('white')}
              className="flex flex-col items-center space-y-2 p-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-white rounded-full border-2 border-gray-300"></div>
              <span className="text-sm font-medium text-white">Play as White</span>
              <span className="text-xs text-gray-400">You move first</span>
            </button>

            <button
              onClick={() => handleNewGame('black')}
              className="flex flex-col items-center space-y-2 p-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gray-800 rounded-full border-2 border-gray-600"></div>
              <span className="text-sm font-medium text-white">Play as Black</span>
              <span className="text-xs text-gray-400">Maia moves first</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};