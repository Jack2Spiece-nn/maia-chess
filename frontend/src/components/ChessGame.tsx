import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChessGame } from '../hooks/useChessGame';
import { useChessSound } from '../hooks/useSound';
import { EnhancedChessboard } from './EnhancedChessboard';
import { GameControls } from './GameControls';
import { GameStatus } from './GameStatus';
import { MoveHistory } from './MoveHistory';
import { AiSettings } from './AiSettings';
import { GameSettings } from './GameSettings';

export const ChessGame: React.FC = () => {
  const {
    gameState,
    error,
    makeMove,
    startNewGame,
    resignGame,
    setAiLevel,
    clearError,
  } = useChessGame();

  const { playSound, toggleMute, isMuted } = useChessSound();

  // UI Settings State
  const [theme, setTheme] = useState<'classic' | 'modern' | 'neon' | 'wood'>('classic');
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [showPossibleMoves, setShowPossibleMoves] = useState(true);
  const [autoRotateBoard, setAutoRotateBoard] = useState(false);

  // Play sounds based on game events
  useEffect(() => {
    if (gameState.moveHistory.length > 0) {
      const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
      
      // Determine move type and play appropriate sound
      if (gameState.gameStatus === 'checkmate') {
        playSound('checkmate');
      } else if (gameState.chess.inCheck()) {
        playSound('check');
      } else if (lastMove.includes('x')) {
        playSound('capture');
      } else if (lastMove.includes('O-O')) {
        playSound('castle');
      } else if (lastMove.includes('=')) {
        playSound('promote');
      } else {
        playSound('move');
      }
    }
  }, [gameState.moveHistory, gameState.gameStatus, gameState.chess, playSound]);

  // Play game start sound
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.moveHistory.length === 0) {
      setTimeout(() => playSound('gameStart'), 500);
    }
  }, [gameState.gameStatus, gameState.moveHistory.length, playSound]);

  // Play game end sound
  useEffect(() => {
    if (['checkmate', 'stalemate', 'draw', 'resigned'].includes(gameState.gameStatus)) {
      setTimeout(() => playSound('gameEnd'), 1000);
    }
  }, [gameState.gameStatus, playSound]);

  const handleMove = async (from: string, to: string): Promise<boolean> => {
    return await makeMove(from, to);
  };

  const handleNewGame = (playerColor: 'white' | 'black' = 'white', aiLevel: number = gameState.aiLevel) => {
    startNewGame(playerColor, aiLevel);
  };

  const boardOrientation = autoRotateBoard 
    ? gameState.playerColor 
    : gameState.playerColor;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-4"
    >
      {/* Mobile Header Controls */}
      <div className="md:hidden mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GameSettings
            theme={theme}
            onThemeChange={setTheme}
            isSoundEnabled={!isMuted()}
            onSoundToggle={toggleMute}
            showCoordinates={showCoordinates}
            onCoordinatesToggle={() => setShowCoordinates(!showCoordinates)}
            showPossibleMoves={showPossibleMoves}
            onPossibleMovesToggle={() => setShowPossibleMoves(!showPossibleMoves)}
            autoRotateBoard={autoRotateBoard}
            onAutoRotateToggle={() => setAutoRotateBoard(!autoRotateBoard)}
          />
        </div>
        <div className="text-white text-sm font-medium">
          Maia {gameState.aiLevel}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chess Board - Takes more space on desktop */}
        <div className="lg:col-span-3">
          <div className="game-panel">
            {/* Game Status */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <GameStatus gameState={gameState} />
              
              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300"
                >
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={clearError}
                    className="mt-2 text-xs bg-red-500/30 hover:bg-red-500/40 px-2 py-1 rounded transition-colors"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </motion.div>
            
            {/* Enhanced Chess Board */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex justify-center"
            >
              <EnhancedChessboard
                chess={gameState.chess}
                playerColor={boardOrientation}
                onMove={handleMove}
                isPlayerTurn={gameState.isPlayerTurn}
                isThinking={gameState.isThinking}
                lastMove={gameState.lastMove}
                theme={theme}
                showCoordinates={showCoordinates}
                showPossibleMoves={showPossibleMoves}
              />
            </motion.div>

            {/* Mobile Game Controls */}
            <div className="md:hidden mt-6">
              <div className="mobile-controls">
                <button
                  onClick={() => handleNewGame('white')}
                  className="button-primary"
                  disabled={gameState.isThinking}
                >
                  New Game
                </button>
                <button
                  onClick={resignGame}
                  className="button-danger"
                  disabled={gameState.gameStatus !== 'playing' || gameState.isThinking}
                >
                  Resign
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel - Controls & Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Desktop Settings */}
          <div className="hidden md:block">
            <GameSettings
              theme={theme}
              onThemeChange={setTheme}
              isSoundEnabled={!isMuted()}
              onSoundToggle={toggleMute}
              showCoordinates={showCoordinates}
              onCoordinatesToggle={() => setShowCoordinates(!showCoordinates)}
              showPossibleMoves={showPossibleMoves}
              onPossibleMovesToggle={() => setShowPossibleMoves(!showPossibleMoves)}
              autoRotateBoard={autoRotateBoard}
              onAutoRotateToggle={() => setAutoRotateBoard(!autoRotateBoard)}
            />
          </div>

          {/* Game Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="hidden md:block"
          >
            <GameControls
              gameState={gameState}
              onNewGame={handleNewGame}
              onResign={resignGame}
            />
          </motion.div>
          
          {/* AI Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <AiSettings
              currentLevel={gameState.aiLevel}
              onLevelChange={setAiLevel}
              disabled={gameState.gameStatus === 'playing'}
            />
          </motion.div>
          
          {/* Move History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="flex-1"
          >
            <MoveHistory 
              moves={gameState.moveHistory}
              gameStatus={gameState.gameStatus}
            />
          </motion.div>

          {/* Performance Info (Desktop only) */}
          <div className="hidden lg:block text-xs text-white/50 text-center">
            <div className="border-t border-white/20 pt-2">
              Theme: {theme} | Sound: {isMuted() ? 'Off' : 'On'}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile Settings */}
      <div className="md:hidden fixed bottom-4 right-4 z-30">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
          className="floating-animation"
        >
          <button
            onClick={toggleMute}
            className={`touch-target rounded-full shadow-lg ${
              isMuted() ? 'sound-button muted' : 'sound-button'
            }`}
            aria-label={isMuted() ? 'Enable Sound' : 'Disable Sound'}
          >
            {isMuted() ? '🔇' : '🔊'}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};