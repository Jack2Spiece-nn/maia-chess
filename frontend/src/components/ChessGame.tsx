import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessGame } from '../hooks/useChessGame';
import { useDeviceType } from '../hooks/useDeviceType';
import { useChessSound } from '../hooks/useSound';
import { GameControls } from './GameControls';
import { GameStatus } from './GameStatus';
import { MoveHistory } from './MoveHistory';
import { AiSettings } from './AiSettings';
import { SoundSettings } from './SoundSettings';
import { clsx } from 'clsx';

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

  const { isMobile, isTablet, isTouch, orientation } = useDeviceType();
  const { playSound } = useChessSound();
  const [lastMove, setLastMove] = useState<string | null>(null);
  const [capturedPiece, setCapturedPiece] = useState<boolean>(false);

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Don't allow moves if it's not the player's turn or game is over
    if (!gameState.isPlayerTurn || gameState.gameStatus !== 'playing' || gameState.isThinking) {
      return false;
    }

    // Check if this is a capture move
    const targetPiece = gameState.chess.get(targetSquare as any);
    const isCapture = targetPiece !== null;

    // Make the move synchronously
    try {
      const success = makeMove(sourceSquare, targetSquare);
      
      if (success) {
        // Play appropriate sound
        if (isCapture) {
          playSound('capture');
          setCapturedPiece(true);
          setTimeout(() => setCapturedPiece(false), 600);
        } else {
          playSound('move');
        }
        
        setLastMove(`${sourceSquare}${targetSquare}`);
        setTimeout(() => setLastMove(null), 800);

        // Check for check or checkmate after move
        setTimeout(() => {
          if (gameState.chess.isCheckmate()) {
            playSound('checkmate');
          } else if (gameState.chess.isCheck()) {
            playSound('check');
          }
        }, 100);
        
        return true;
      }
    } catch (error) {
      console.error('Move failed:', error);
    }

    return false;
  };

  const handleNewGame = (playerColor: any, aiLevel: number) => {
    startNewGame(playerColor, aiLevel);
    playSound('gameStart');
  };

  const handleResign = () => {
    resignGame();
    playSound('gameEnd');
  };

  const isPlayerWhite = gameState.playerColor === 'white';

  // Mobile layout optimization
  const isMobileLayout = isMobile || (isTablet && orientation === 'portrait');

  const boardSize = isMobile 
    ? Math.min(window.innerWidth - 32, window.innerHeight - 300)
    : isTablet 
    ? Math.min(window.innerWidth * 0.6, window.innerHeight - 200)
    : undefined;

  return (
    <div className={clsx(
      "max-w-7xl mx-auto",
      isMobileLayout ? "flex flex-col" : "grid grid-cols-1 lg:grid-cols-3 gap-8"
    )}>
      {/* Mobile Header - Only on mobile */}
      {isMobileLayout && (
        <div className="px-4 py-2">
          <GameStatus gameState={gameState} />
          {error && (
            <div className="mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              <p>{error}</p>
              <button
                onClick={clearError}
                className="mt-1 text-xs bg-red-500/30 hover:bg-red-500/40 px-2 py-1 rounded button-touch"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chess Board */}
      <div className={clsx(
        isMobileLayout ? "order-1" : "lg:col-span-2"
      )}>
        <div className={clsx(
          "game-panel",
          isMobileLayout ? "game-panel-mobile mx-2" : "",
          lastMove && "move-highlight",
          capturedPiece && "capture-animation"
        )}>
          {/* Desktop Status */}
          {!isMobileLayout && (
            <div className="mb-6">
              <GameStatus gameState={gameState} />
              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={clearError}
                    className="mt-2 text-xs bg-red-500/30 hover:bg-red-500/40 px-2 py-1 rounded"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div className={clsx(
            "mx-auto",
            isMobile ? "chess-board-mobile" : "chess-board max-w-lg"
          )}>
            <Chessboard
              position={gameState.chess.fen()}
              onPieceDrop={onDrop}
              boardOrientation={isPlayerWhite ? 'white' : 'black'}
              arePiecesDraggable={
                gameState.isPlayerTurn && 
                gameState.gameStatus === 'playing' && 
                !gameState.isThinking
              }
              customBoardStyle={{
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
              customDarkSquareStyle={{ 
                backgroundColor: '#b58863',
                ...(isTouch && { cursor: 'pointer' })
              }}
              customLightSquareStyle={{ 
                backgroundColor: '#f0d9b5',
                ...(isTouch && { cursor: 'pointer' })
              }}
              customDropSquareStyle={{
                boxShadow: 'inset 0 0 1px 6px rgba(255,255,255,0.75)'
              }}
              {...(boardSize && { boardWidth: boardSize })}
            />
          </div>

          {gameState.isThinking && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-500/30 rounded-lg px-4 py-2">
                <div className="loading-spinner h-4 w-4"></div>
                <span className="text-blue-300 text-sm">
                  {isMobile ? 'Maia thinking...' : 'Maia is thinking...'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Controls & Info */}
      <div className={clsx(
        "space-y-4",
        isMobileLayout ? "order-2 px-2 pb-4" : ""
      )}>
        {/* Mobile Optimized Controls */}
        {isMobileLayout ? (
          <div className="grid grid-cols-1 gap-4">
            <GameControls
              gameState={gameState}
              onNewGame={handleNewGame}
              onResign={handleResign}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <AiSettings
                currentLevel={gameState.aiLevel}
                onLevelChange={setAiLevel}
                disabled={gameState.gameStatus === 'playing'}
              />
              <SoundSettings />
            </div>
            
            <MoveHistory 
              moves={gameState.moveHistory}
              gameStatus={gameState.gameStatus}
            />
          </div>
        ) : (
          /* Desktop Layout */
          <>
            <GameControls
              gameState={gameState}
              onNewGame={handleNewGame}
              onResign={handleResign}
            />
            
            <AiSettings
              currentLevel={gameState.aiLevel}
              onLevelChange={setAiLevel}
              disabled={gameState.gameStatus === 'playing'}
            />

            <SoundSettings />
            
            <MoveHistory 
              moves={gameState.moveHistory}
              gameStatus={gameState.gameStatus}
            />
          </>
        )}
      </div>
    </div>
  );
};