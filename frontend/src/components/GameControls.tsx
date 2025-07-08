import React, { useState } from 'react';
import { GameState, PlayerColor } from '../types/game';
import { Play, Square, Flag, Palette, Zap, Crown, Trophy, Target, Sparkles, ChevronRight } from 'lucide-react';
import { useDeviceType } from '../hooks/useDeviceType';
import { useChessSound } from '../hooks/useSound';
import { useTheme } from '../hooks/useTheme';
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
  const [hoveredColor, setHoveredColor] = useState<PlayerColor | null>(null);
  const { isMobile } = useDeviceType();
  const { playSound } = useChessSound();
  const { actualTheme } = useTheme();

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

  const getGameStatusInfo = () => {
    switch (gameState.gameStatus) {
      case 'checkmate':
        return { 
          icon: '👑', 
          text: 'Checkmate!', 
          color: 'red',
          gradient: 'from-red-500 to-pink-600'
        };
      case 'stalemate':
        return { 
          icon: '🤝', 
          text: 'Stalemate', 
          color: 'yellow',
          gradient: 'from-yellow-500 to-orange-500'
        };
      case 'draw':
        return { 
          icon: '⚖️', 
          text: 'Draw', 
          color: 'blue',
          gradient: 'from-blue-500 to-indigo-600'
        };
      default:
        return null;
    }
  };

  const statusInfo = getGameStatusInfo();

  return (
    <div className={clsx(
      "game-panel space-y-5 relative overflow-hidden",
      isMobile && "game-panel-mobile"
    )}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <h3 className={clsx(
          "font-bold flex items-center space-x-3 relative",
          isMobile ? "text-lg" : "text-xl",
          actualTheme === 'light' ? "text-gray-800" : "text-white"
        )}>
          <div className={clsx(
            "p-2 rounded-xl transition-all duration-300",
            actualTheme === 'light' 
              ? "bg-gradient-to-br from-purple-500 to-indigo-600" 
              : "bg-gradient-to-br from-purple-600 to-blue-700"
          )}>
            <Square className="w-5 h-5 text-white" />
          </div>
          <span className="font-chess">Game Control</span>
          {gameState.gameStatus === 'playing' && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
            </div>
          )}
        </h3>

        {/* Game info indicator */}
        {gameState.moveHistory.length > 0 && (
          <div className={clsx(
            "px-3 py-1 rounded-full text-xs font-bold border-2",
            actualTheme === 'light' 
              ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200" 
              : "bg-gradient-to-r from-emerald-900/50 to-green-900/50 text-emerald-300 border-emerald-600/50"
          )}>
            Turn {Math.ceil(gameState.moveHistory.length / 2)}
          </div>
        )}
      </div>

      {!showNewGameOptions ? (
        <div className="space-y-4">
          {/* Main action button */}
          <button
            onClick={handleShowOptions}
            className={clsx(
              "w-full flex items-center justify-center space-x-3 relative overflow-hidden group",
              isMobile ? "button-primary-mobile py-4" : "button-primary py-5"
            )}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            
            <div className="relative z-10 flex items-center space-x-3">
              <div className="p-1 bg-white/20 rounded-lg">
                <Play className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">
                {gameState.gameStatus === 'waiting' ? 'Start New Game' : 'New Game'}
              </span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </button>

          {/* Resign button with enhanced styling */}
          <button
            onClick={handleResign}
            disabled={!canResign}
            className={clsx(
              'w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 touch-feedback shadow-lg relative overflow-hidden group',
              isMobile && 'min-h-14',
              canResign
                ? [
                    'border-2',
                    actualTheme === 'light' 
                      ? 'bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 border-red-200 hover:border-red-300' 
                      : 'bg-gradient-to-r from-red-900/30 to-pink-900/30 hover:from-red-800/40 hover:to-pink-800/40 text-red-400 border-red-500/50 hover:border-red-400'
                  ]
                : [
                    'border-2 cursor-not-allowed opacity-50',
                    actualTheme === 'light' 
                      ? 'bg-gray-100 text-gray-400 border-gray-200' 
                      : 'bg-gray-800 text-gray-500 border-gray-600'
                  ]
            )}
          >
            {canResign && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            )}
            <Flag className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Resign Game</span>
          </button>

          {/* Enhanced Game Status */}
          {statusInfo && (
            <div className="text-center pt-2">
              <div className={clsx(
                "inline-flex items-center space-x-3 px-6 py-4 rounded-2xl font-bold shadow-xl border-2 relative overflow-hidden group",
                `bg-gradient-to-r ${statusInfo.gradient}`,
                "text-white border-white/30"
              )}>
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-gradient-shift"></div>
                
                <span className="text-2xl relative z-10">{statusInfo.icon}</span>
                <span className="text-lg font-chess relative z-10">{statusInfo.text}</span>
                <Sparkles className="w-5 h-5 relative z-10 animate-pulse" />
              </div>
            </div>
          )}

          {/* Enhanced Stats Panel */}
          {gameState.moveHistory.length > 0 && (
            <div className={clsx(
              "rounded-2xl p-5 space-y-4 border-2 relative overflow-hidden",
              actualTheme === 'light' 
                ? "bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-purple-200" 
                : "bg-gradient-to-br from-purple-900/30 via-indigo-900/30 to-blue-900/30 border-purple-500/30"
            )}>
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-gradient-shift"></div>
              
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className={clsx(
                      "w-5 h-5",
                      actualTheme === 'light' ? "text-purple-600" : "text-purple-400"
                    )} />
                    <span className={clsx(
                      "font-semibold",
                      actualTheme === 'light' ? "text-gray-700" : "text-gray-200"
                    )}>
                      Game Progress
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={clsx(
                    "text-center p-3 rounded-xl border",
                    actualTheme === 'light' 
                      ? "bg-white/70 border-white/50" 
                      : "bg-gray-800/50 border-gray-700/50"
                  )}>
                    <div className={clsx(
                      "text-2xl font-bold",
                      actualTheme === 'light' ? "text-gray-800" : "text-white"
                    )}>
                      {Math.ceil(gameState.moveHistory.length / 2)}
                    </div>
                    <div className={clsx(
                      "text-xs font-medium",
                      actualTheme === 'light' ? "text-gray-600" : "text-gray-300"
                    )}>
                      Moves
                    </div>
                  </div>

                  <div className={clsx(
                    "text-center p-3 rounded-xl border",
                    actualTheme === 'light' 
                      ? "bg-white/70 border-white/50" 
                      : "bg-gray-800/50 border-gray-700/50"
                  )}>
                    <div className={clsx(
                      "text-lg font-bold flex items-center justify-center space-x-1",
                      actualTheme === 'light' ? "text-gray-800" : "text-white"
                    )}>
                      <Crown className="w-4 h-4" />
                      <span>{getLevelFromRating(gameState.aiLevel)}</span>
                    </div>
                    <div className={clsx(
                      "text-xs font-medium",
                      actualTheme === 'light' ? "text-gray-600" : "text-gray-300"
                    )}>
                      AI Level
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Enhanced header for color selection */}
          <div className="flex items-center justify-between">
            <h4 className={clsx(
              "font-bold flex items-center space-x-3",
              isMobile ? "text-base" : "text-lg",
              actualTheme === 'light' ? "text-gray-800" : "text-white"
            )}>
              <div className={clsx(
                "p-2 rounded-xl",
                actualTheme === 'light' 
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600" 
                  : "bg-gradient-to-br from-indigo-600 to-purple-700"
              )}>
                <Palette className="w-4 h-4 text-white" />
              </div>
              <span>Choose Your Side</span>
            </h4>
            <button
              onClick={() => {
                setShowNewGameOptions(false);
                playSound('buttonClick');
              }}
              className={clsx(
                "px-4 py-2 rounded-xl font-medium transition-all duration-200 touch-feedback border-2",
                actualTheme === 'light' 
                  ? "text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 border-gray-200" 
                  : "text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 border-gray-600"
              )}
            >
              Cancel
            </button>
          </div>

          {/* Enhanced color selection */}
          <div className={clsx(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-2"
          )}>
            {/* White pieces */}
            <button
              onClick={() => handleNewGame('white')}
              onMouseEnter={() => setHoveredColor('white')}
              onMouseLeave={() => setHoveredColor(null)}
              className={clsx(
                "group relative flex items-center space-x-4 p-5 rounded-2xl border-3 transition-all duration-300 touch-feedback shadow-lg hover:shadow-xl transform hover:scale-105",
                isMobile && "min-h-20",
                hoveredColor === 'white' || isMobile 
                  ? "border-purple-400 bg-gradient-to-br from-white to-gray-50" 
                  : "border-gray-200 bg-white hover:border-gray-300",
                actualTheme === 'dark' && "hover:bg-gray-50"
              )}
            >
              {/* Glow effect */}
              {hoveredColor === 'white' && !isMobile && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 to-indigo-400/20 animate-pulse"></div>
              )}
              
              <div className="relative z-10 flex items-center space-x-4 w-full">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 via-white to-gray-50 rounded-2xl border-3 border-gray-300 shadow-lg flex items-center justify-center">
                    <Crown className="w-6 h-6 text-gray-600" />
                  </div>
                  {hoveredColor === 'white' && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                    </div>
                  )}
                </div>
                
                <div className="text-left flex-1">
                  <div className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                    <span>Play as White</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                  <div className="text-sm text-gray-600 font-medium">You move first • Advantage</div>
                </div>
              </div>
            </button>

            {/* Black pieces */}
            <button
              onClick={() => handleNewGame('black')}
              onMouseEnter={() => setHoveredColor('black')}
              onMouseLeave={() => setHoveredColor(null)}
              className={clsx(
                "group relative flex items-center space-x-4 p-5 rounded-2xl border-3 transition-all duration-300 touch-feedback shadow-lg hover:shadow-xl transform hover:scale-105",
                isMobile && "min-h-20",
                hoveredColor === 'black' || isMobile 
                  ? "border-purple-400 bg-gradient-to-br from-gray-900 to-gray-800" 
                  : "border-gray-200 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-gray-300"
              )}
            >
              {/* Glow effect */}
              {hoveredColor === 'black' && !isMobile && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 to-indigo-400/20 animate-pulse"></div>
              )}
              
              <div className="relative z-10 flex items-center space-x-4 w-full">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl border-3 border-gray-600 shadow-lg flex items-center justify-center">
                    <Crown className="w-6 h-6 text-gray-300" />
                  </div>
                  {hoveredColor === 'black' && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    </div>
                  )}
                </div>
                
                <div className="text-left flex-1">
                  <div className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>Play as Black</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                  <div className="text-sm text-gray-300 font-medium">Maia moves first • Strategy</div>
                </div>
              </div>
            </button>
          </div>

          {/* Enhanced AI preview */}
          <div className={clsx(
            "rounded-2xl p-5 border-2 relative overflow-hidden",
            actualTheme === 'light' 
              ? "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-200" 
              : "bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-pink-900/30 border-indigo-500/30"
          )}>
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-gradient-shift"></div>
            
            <div className="relative z-10 text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Trophy className={clsx(
                  "w-5 h-5",
                  actualTheme === 'light' ? "text-indigo-600" : "text-indigo-400"
                )} />
                <span className={clsx(
                  "font-bold text-lg",
                  actualTheme === 'light' ? "text-gray-800" : "text-white"
                )}>
                  Your Opponent
                </span>
              </div>
              
              <div className="space-y-2">
                <div className={clsx(
                  "text-xl font-chess",
                  actualTheme === 'light' ? "text-indigo-600" : "text-indigo-400"
                )}>
                  Maia {getLevelFromRating(gameState.aiLevel)}
                </div>
                <div className={clsx(
                  "text-sm font-medium",
                  actualTheme === 'light' ? "text-gray-600" : "text-gray-300"
                )}>
                  Target Rating: <span className="font-bold text-purple-600">{gameState.aiLevel} ELO</span>
                </div>
                <div className={clsx(
                  "text-xs",
                  actualTheme === 'light' ? "text-gray-500" : "text-gray-400"
                )}>
                  Human-like neural network trained on real games
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};