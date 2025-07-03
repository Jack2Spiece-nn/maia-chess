import React, { useState } from 'react';
import { GameState, PlayerColor } from '../types/game';
import { Play, Square, Flag, Palette, Zap } from 'lucide-react';
import { useDeviceType } from '../hooks/useDeviceType';
import { useChessSound } from '../hooks/useSound';
import { getLevelFromRating } from './AiSettings';
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
  const { isMobile } = useDeviceType();
  const { playSound } = useChessSound();

  const handleNewGame = (color: PlayerColor) => {
    onNewGame(color, gameState.aiLevel);
    setShowNewGameOptions(false);
    playSound('buttonClick');
  };

  const handleShowOptions = () => {
    setShowNewGameOptions(true);
    playSound('buttonClick');
  };

  const handleResign = () => {
    onResign();
    playSound('buttonClick');
  };

  const canResign = gameState.gameStatus === 'playing' && !gameState.isThinking;

  return (
    <div className={clsx(
      "game-panel space-y-4",
      isMobile && "game-panel-mobile"
    )}>
      <h3 className={clsx(
        "font-semibold text-gray-800 flex items-center space-x-2",
        isMobile ? "text-base" : "text-lg"
      )}>
        <Square className={clsx("w-5 h-5 text-purple-600", isMobile && "w-4 h-4")} />
        <span>Game Controls</span>
        {gameState.gameStatus === 'playing' && (
          <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
        )}
      </h3>

      {!showNewGameOptions ? (
        <div className="space-y-3">
          <button
            onClick={handleShowOptions}
            className={clsx(
              "w-full flex items-center justify-center space-x-2 touch-feedback",
              isMobile ? "button-primary-mobile" : "button-primary"
            )}
          >
            <Play className="w-4 h-4" />
            <span>{gameState.gameStatus === 'waiting' ? 'Start Game' : 'New Game'}</span>
          </button>

          <button
            onClick={handleResign}
            disabled={!canResign}
            className={clsx(
              'w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 touch-feedback shadow-md',
              isMobile && 'button-touch min-h-12',
              canResign
                ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 active:bg-red-200'
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
            )}
          >
            <Flag className="w-4 h-4" />
            <span>Resign</span>
          </button>

          {/* Game Status Indicator */}
          {gameState.gameStatus !== 'waiting' && gameState.gameStatus !== 'playing' && (
            <div className="text-center pt-2">
              <div className={clsx(
                "inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium shadow-sm",
                gameState.gameStatus === 'checkmate' && "bg-red-50 text-red-600 border border-red-200",
                gameState.gameStatus === 'stalemate' && "bg-yellow-50 text-yellow-600 border border-yellow-200",
                gameState.gameStatus === 'draw' && "bg-blue-50 text-blue-600 border border-blue-200"
              )}>
                <span className="text-sm font-semibold">
                  {gameState.gameStatus === 'checkmate' && '👑 Checkmate'}
                  {gameState.gameStatus === 'stalemate' && '🤝 Stalemate'}
                  {gameState.gameStatus === 'draw' && '🤝 Draw'}
                </span>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {gameState.moveHistory.length > 0 && (
            <div className="bg-purple-50 rounded-xl p-3.5 space-y-2 border border-purple-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Moves:</span>
                <span className="text-gray-800 font-semibold">{Math.ceil(gameState.moveHistory.length / 2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">AI Level:</span>
                <span className="text-gray-800 font-semibold">{getLevelFromRating(gameState.aiLevel)}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={clsx(
              "font-medium text-gray-800 flex items-center space-x-2",
              isMobile ? "text-sm" : "text-md"
            )}>
              <Palette className="w-4 h-4 text-purple-600" />
              <span>Choose Your Color</span>
            </h4>
            <button
              onClick={() => {
                setShowNewGameOptions(false);
                playSound('buttonClick');
              }}
              className="text-gray-500 hover:text-gray-700 text-sm touch-feedback button-touch font-medium"
            >
              Cancel
            </button>
          </div>

          <div className={clsx(
            "grid gap-3",
            isMobile ? "grid-cols-1 space-y-0" : "grid-cols-2"
          )}>
            <button
              onClick={() => handleNewGame('white')}
              className={clsx(
                "flex items-center space-x-3 p-4 bg-white hover:bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all duration-200 touch-feedback shadow-sm hover:shadow-md",
                isMobile && "min-h-16"
              )}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-white rounded-lg border-2 border-gray-300 shadow-inner flex-shrink-0"></div>
              <div className="text-left flex-1">
                <div className="text-sm font-semibold text-gray-800">Play as White</div>
                <div className="text-xs text-gray-500">You move first</div>
              </div>
            </button>

            <button
              onClick={() => handleNewGame('black')}
              className={clsx(
                "flex items-center space-x-3 p-4 bg-white hover:bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all duration-200 touch-feedback shadow-sm hover:shadow-md",
                isMobile && "min-h-16"
              )}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700 shadow-inner flex-shrink-0"></div>
              <div className="text-left flex-1">
                <div className="text-sm font-semibold text-gray-800">Play as Black</div>
                <div className="text-xs text-gray-500">Maia moves first</div>
              </div>
            </button>
          </div>

          {/* Difficulty Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3.5 border border-purple-100">
            <div className="text-xs text-gray-600 text-center">
              Current AI Level: <span className="text-gray-800 font-semibold">{getLevelFromRating(gameState.aiLevel)}</span>
              <br />
              Target Rating: <span className="text-purple-600 font-semibold">{gameState.aiLevel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};