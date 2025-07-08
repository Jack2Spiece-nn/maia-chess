import React from 'react';
import { GameState } from '../types/game';
import { Trophy, Clock, AlertCircle, User, Bot, Crown, Zap, Shield, Target, Sparkles } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useDeviceType } from '../hooks/useDeviceType';
import { getLevelFromRating } from './AiSettings';
import { clsx } from 'clsx';

interface GameStatusProps {
  gameState: GameState;
}

export const GameStatus: React.FC<GameStatusProps> = ({ gameState }) => {
  const { actualTheme } = useTheme();
  const { isMobile } = useDeviceType();

  const getStatusMessage = () => {
    switch (gameState.gameStatus) {
      case 'waiting':
        return 'Ready to Begin';
      case 'playing':
        if (gameState.isThinking) {
          return 'Maia is calculating...';
        }
        return gameState.isPlayerTurn ? 'Your Move' : "Maia's Turn";
      case 'checkmate':
        const winner = gameState.chess.turn() === 'w' ? 'Black' : 'White';
        return `Checkmate! ${winner} Wins`;
      case 'stalemate':
        return 'Stalemate - Draw!';
      case 'draw':
        return 'Draw Game!';
      case 'resigned':
        return 'Game Resigned';
      default:
        return 'Game Complete';
    }
  };

  const getStatusIcon = () => {
    const iconClass = "w-6 h-6 transition-all duration-300";
    
    switch (gameState.gameStatus) {
      case 'checkmate':
        return <Trophy className={clsx(iconClass, "text-yellow-500 animate-bounce")} />;
      case 'playing':
        if (gameState.isThinking) {
          return <Bot className={clsx(iconClass, "text-purple-500 animate-spin")} />;
        }
        return gameState.isPlayerTurn ? 
          <User className={clsx(iconClass, "text-blue-500 animate-pulse")} /> : 
          <Bot className={clsx(iconClass, "text-purple-500 animate-pulse")} />;
      case 'stalemate':
      case 'draw':
        return <Shield className={clsx(iconClass, "text-orange-500 animate-bounce")} />;
      case 'waiting':
        return <Target className={clsx(iconClass, "text-green-500 animate-pulse")} />;
      default:
        return <Clock className={clsx(iconClass, "text-gray-500")} />;
    }
  };

  const getStatusInfo = () => {
    switch (gameState.gameStatus) {
      case 'checkmate':
        return {
          bgGradient: 'from-yellow-400/20 via-orange-400/20 to-red-400/20',
          borderColor: 'border-yellow-400/40',
          textColor: 'text-yellow-700',
          textColorDark: 'text-yellow-300',
          glowColor: 'shadow-yellow-400/30',
        };
      case 'playing':
        if (gameState.isThinking) {
          return {
            bgGradient: 'from-purple-400/20 via-indigo-400/20 to-blue-400/20',
            borderColor: 'border-purple-400/40',
            textColor: 'text-purple-700',
            textColorDark: 'text-purple-300',
            glowColor: 'shadow-purple-400/30',
          };
        }
        return gameState.isPlayerTurn ? {
          bgGradient: 'from-blue-400/20 via-indigo-400/20 to-purple-400/20',
          borderColor: 'border-blue-400/40',
          textColor: 'text-blue-700',
          textColorDark: 'text-blue-300',
          glowColor: 'shadow-blue-400/30',
        } : {
          bgGradient: 'from-purple-400/20 via-pink-400/20 to-indigo-400/20',
          borderColor: 'border-purple-400/40',
          textColor: 'text-purple-700',
          textColorDark: 'text-purple-300',
          glowColor: 'shadow-purple-400/30',
        };
      case 'stalemate':
      case 'draw':
        return {
          bgGradient: 'from-orange-400/20 via-yellow-400/20 to-amber-400/20',
          borderColor: 'border-orange-400/40',
          textColor: 'text-orange-700',
          textColorDark: 'text-orange-300',
          glowColor: 'shadow-orange-400/30',
        };
      default:
        return {
          bgGradient: 'from-gray-400/20 via-slate-400/20 to-gray-400/20',
          borderColor: 'border-gray-400/40',
          textColor: 'text-gray-700',
          textColorDark: 'text-gray-300',
          glowColor: 'shadow-gray-400/30',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const isInCheck = gameState.chess.inCheck();
  const moveNumber = Math.ceil(gameState.moveHistory.length / 2);

  return (
    <div className={clsx(
      "relative overflow-hidden rounded-2xl border-2 shadow-xl transition-all duration-500",
      "bg-gradient-to-r", statusInfo.bgGradient,
      statusInfo.borderColor,
      isMobile ? "p-4" : "p-5"
    )}>
      {/* Animated background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-gradient-shift"></div>
      
      {/* Glow effect for active states */}
      {(gameState.gameStatus === 'playing' || gameState.gameStatus === 'checkmate') && (
        <div className={clsx(
          "absolute inset-0 rounded-2xl blur-xl opacity-20 animate-glow-pulse",
          statusInfo.glowColor
        )}></div>
      )}

      <div className="relative z-10 flex items-center justify-between">
        {/* Left section - Status */}
        <div className="flex items-center space-x-4">
          {/* Enhanced status icon with container */}
          <div className={clsx(
            "relative p-3 rounded-2xl transition-all duration-300",
            actualTheme === 'light' 
              ? "bg-white/80 shadow-lg" 
              : "bg-gray-800/80 shadow-lg"
          )}>
            {getStatusIcon()}
            
            {/* Thinking indicator dots */}
            {gameState.isThinking && (
              <div className="absolute -bottom-1 -right-1 flex space-x-1">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            )}
          </div>

          {/* Status text */}
          <div className={clsx("space-y-1", isMobile && "space-y-0.5")}>
            <h3 className={clsx(
              "font-black font-chess transition-colors duration-300",
              isMobile ? "text-lg" : "text-xl",
              actualTheme === 'light' ? statusInfo.textColor : statusInfo.textColorDark
            )}>
              {getStatusMessage()}
            </h3>
            <p className={clsx(
              "font-medium transition-colors duration-300",
              isMobile ? "text-sm" : "text-base",
              actualTheme === 'light' ? "text-gray-600" : "text-gray-300"
            )}>
              Playing as{' '}
              <span className={clsx(
                "capitalize font-bold px-2 py-0.5 rounded-lg",
                gameState.playerColor === 'white' 
                  ? "bg-gray-100 text-gray-800" 
                  : "bg-gray-800 text-white"
              )}>
                {gameState.playerColor}
              </span>
              {' '}vs{' '}
              <span className={clsx(
                "font-bold",
                actualTheme === 'light' ? "text-purple-600" : "text-purple-400"
              )}>
                Maia {getLevelFromRating(gameState.aiLevel)}
              </span>
            </p>
          </div>
        </div>
        
        {/* Right section - Game info */}
        <div className="text-right space-y-2">
          {/* Move counter */}
          <div className={clsx(
            "flex items-center space-x-2 justify-end",
            isMobile && "text-sm"
          )}>
            <Crown className={clsx(
              "w-4 h-4",
              actualTheme === 'light' ? "text-indigo-600" : "text-indigo-400"
            )} />
            <span className={clsx(
              "font-bold",
              actualTheme === 'light' ? "text-gray-700" : "text-gray-200"
            )}>
              Move {moveNumber}
            </span>
          </div>

          {/* ELO rating display */}
          <div className={clsx(
            "flex items-center space-x-1 justify-end",
            isMobile && "text-xs"
          )}>
            <Zap className={clsx(
              "w-3 h-3",
              actualTheme === 'light' ? "text-yellow-600" : "text-yellow-400"
            )} />
            <span className={clsx(
              "font-semibold",
              actualTheme === 'light' ? "text-gray-600" : "text-gray-300"
            )}>
              {gameState.aiLevel} ELO
            </span>
          </div>

          {/* Check warning */}
          {isInCheck && (
            <div className={clsx(
              "flex items-center space-x-2 justify-end px-3 py-1 rounded-lg border-2 animate-pulse",
              "bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/50"
            )}>
              <AlertCircle className="w-4 h-4 text-red-500 animate-bounce" />
              <span className="text-red-500 font-bold text-sm">CHECK!</span>
              <Sparkles className="w-3 h-3 text-red-400 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator for active games */}
      {gameState.gameStatus === 'playing' && moveNumber > 0 && (
        <div className="mt-4 relative">
          <div className={clsx(
            "flex items-center justify-between text-xs font-medium mb-1",
            actualTheme === 'light' ? "text-gray-600" : "text-gray-300"
          )}>
            <span>Game Progress</span>
            <span>{moveNumber} moves</span>
          </div>
          
          {/* Progress bar */}
          <div className={clsx(
            "h-2 rounded-full overflow-hidden",
            actualTheme === 'light' ? "bg-white/50" : "bg-gray-700/50"
          )}>
            <div 
              className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 rounded-full transition-all duration-500 animate-gradient-shift"
              style={{ 
                width: `${Math.min(100, (moveNumber / 40) * 100)}%`,
                backgroundSize: '200% 100%'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};