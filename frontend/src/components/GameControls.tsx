import React, { useState } from 'react';
import { GameState, PlayerColor } from '../types/game';
import { Play, Square, Flag, RotateCcw, Palette, Zap } from 'lucide-react';
import { useDeviceType } from '../hooks/useDeviceType';
import { useChessSound } from '../hooks/useSound';
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
  const { isMobile, isTouch } = useDeviceType();
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
        "font-semibold text-white flex items-center space-x-2",
        isMobile ? "text-base" : "text-lg"
      )}>
        <Square className={clsx("w-5 h-5", isMobile && "w-4 h-4")} />
        <span>Game Controls</span>
        {gameState.gameStatus === 'playing' && (
          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
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
              'w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-all duration-200 touch-feedback',
              isMobile && 'button-touch min-h-12',
              canResign
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 active:bg-red-500/40'
                : 'bg-gray-500/20 text-gray-500 border border-gray-500/30 cursor-not-allowed'
            )}
          >
            <Flag className="w-4 h-4" />
            <span>Resign</span>
          </button>

          {/* Game Status Indicator */}
          {gameState.gameStatus !== 'waiting' && gameState.gameStatus !== 'playing' && (
            <div className="text-center pt-2">
              <div className={clsx(
                "inline-flex items-center space-x-2 px-3 py-2 rounded-lg",
                gameState.gameStatus === 'checkmate' && "bg-red-500/20 text-red-300",
                gameState.gameStatus === 'stalemate' && "bg-yellow-500/20 text-yellow-300",
                gameState.gameStatus === 'draw' && "bg-blue-500/20 text-blue-300"
              )}>
                <span className="text-sm font-medium">
                  {gameState.gameStatus === 'checkmate' && '♔ Checkmate'}
                  {gameState.gameStatus === 'stalemate' && '🤝 Stalemate'}
                  {gameState.gameStatus === 'draw' && '🤝 Draw'}
                </span>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {gameState.moveHistory.length > 0 && (
            <div className="bg-white/5 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Moves:</span>
                <span className="text-white font-medium">{Math.ceil(gameState.moveHistory.length / 2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">AI Level:</span>
                <span className="text-white font-medium">{gameState.aiLevel}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={clsx(
              "font-medium text-white flex items-center space-x-2",
              isMobile ? "text-sm" : "text-md"
            )}>
              <Palette className="w-4 h-4" />
              <span>Choose Your Color</span>
            </h4>
            <button
              onClick={() => {
                setShowNewGameOptions(false);
                playSound('buttonClick');
              }}
              className="text-gray-400 hover:text-white text-sm touch-feedback button-touch"
            >
              Cancel
            </button>
          </div>

          <div className={clsx(
            "grid gap-3",
            isMobile ? "grid-cols-1 space-y-2" : "grid-cols-2"
          )}>
            <button
              onClick={() => handleNewGame('white')}
              className={clsx(
                "flex flex-col items-center space-y-2 p-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200 touch-feedback",
                isMobile && "flex-row space-y-0 space-x-3 justify-start"
              )}
            >
              <div className="w-8 h-8 bg-white rounded-full border-2 border-gray-300 flex-shrink-0"></div>
              <div className={clsx("text-center", isMobile && "text-left flex-1")}>
                <div className="text-sm font-medium text-white">Play as White</div>
                <div className="text-xs text-gray-400">You move first</div>
              </div>
            </button>

            <button
              onClick={() => handleNewGame('black')}
              className={clsx(
                "flex flex-col items-center space-y-2 p-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200 touch-feedback",
                isMobile && "flex-row space-y-0 space-x-3 justify-start"
              )}
            >
              <div className="w-8 h-8 bg-gray-800 rounded-full border-2 border-gray-600 flex-shrink-0"></div>
              <div className={clsx("text-center", isMobile && "text-left flex-1")}>
                <div className="text-sm font-medium text-white">Play as Black</div>
                <div className="text-xs text-gray-400">Maia moves first</div>
              </div>
            </button>
          </div>

          {/* Difficulty Preview */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-gray-400 text-center">
              Current AI Level: <span className="text-white font-medium">{gameState.aiLevel}</span>
              <br />
              Estimated Rating: <span className="text-blue-300">{gameState.aiLevel * 100 + 1000}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};