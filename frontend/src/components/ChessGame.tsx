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
    setAiNodes,
    clearError,
  } = useChessGame();

  const { isMobile, isTablet, isTouch, orientation } = useDeviceType();
  const { playSound } = useChessSound();
  const [lastMove, setLastMove] = useState<string | null>(null);
  const [capturedPiece, setCapturedPiece] = useState<boolean>(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [boardFlipped, setBoardFlipped] = useState<boolean>(false);

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Clear selection when using drag-drop
    setSelectedSquare(null);
    setPossibleMoves([]);
    
    // Don't allow moves if it's not the player's turn or game is over
    if (!gameState.isPlayerTurn || gameState.gameStatus !== 'playing' || gameState.isThinking) {
      return false;
    }

    return handleMove(sourceSquare, targetSquare);
  };

  const handleMove = (sourceSquare: string, targetSquare: string) => {
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

  // Mobile layout optimization
  const isMobileLayout = isMobile || (isTablet && orientation === 'portrait');

  const boardSize = isMobile 
    ? Math.min(window.innerWidth - 32, window.innerHeight - 300)
    : isTablet 
    ? Math.min(window.innerWidth * 0.6, window.innerHeight - 200)
    : undefined;

  // Handle square clicks for click-to-move functionality
  const onSquareClick = (square: string) => {
    // Don't allow moves if it's not the player's turn or game is over
    if (!gameState.isPlayerTurn || gameState.gameStatus !== 'playing' || gameState.isThinking) {
      return;
    }

    const piece = gameState.chess.get(square as any);
    
    // If a square is already selected
    if (selectedSquare) {
      // If clicking the same square, deselect it
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }
      
      // Try to make a move
      const success = handleMove(selectedSquare, square);
      
      // Clear selection regardless of move success
      setSelectedSquare(null);
      setPossibleMoves([]);
      
      // If the move failed and we clicked on our own piece, select it
      if (!success && piece && piece.color === gameState.chess.turn()) {
        setSelectedSquare(square);
        // Get possible moves for the selected piece
        const moves = gameState.chess.moves({ square: square as any, verbose: true });
        setPossibleMoves(moves.map((m: any) => m.to));
      }
    } else {
      // No square selected yet - select if it's our piece
      if (piece && piece.color === gameState.chess.turn()) {
        setSelectedSquare(square);
        // Get possible moves for the selected piece
        const moves = gameState.chess.moves({ square: square as any, verbose: true });
        setPossibleMoves(moves.map((m: any) => m.to));
      }
    }
  };

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
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setBoardFlipped(!boardFlipped)}
                className={clsx(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  "bg-slate-700 hover:bg-slate-600 text-white",
                  "border border-slate-600 hover:border-slate-500",
                  isMobile ? "text-xs px-2 py-1" : ""
                )}
              >
                {boardFlipped ? "↑ Flip to White" : "↓ Flip to Black"}
              </button>
            </div>
            <Chessboard
              position={gameState.chess.fen()}
              onPieceDrop={onDrop}
              onSquareClick={onSquareClick}
              boardOrientation={boardFlipped ? 'black' : 'white'}
              arePiecesDraggable={
                gameState.isPlayerTurn && 
                gameState.gameStatus === 'playing' && 
                !gameState.isThinking &&
                !isTouch // Disable dragging on touch devices
              }
              customBoardStyle={{
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
              customDarkSquareStyle={{ 
                backgroundColor: '#b58863',
                cursor: 'pointer'
              }}
              customLightSquareStyle={{ 
                backgroundColor: '#f0d9b5',
                cursor: 'pointer'
              }}
              customDropSquareStyle={{
                boxShadow: 'inset 0 0 1px 6px rgba(255,255,255,0.75)'
              }}
              customSquareStyles={{
                ...(selectedSquare && {
                  [selectedSquare]: {
                    backgroundColor: 'rgba(255, 255, 0, 0.4)',
                    border: '2px solid #FFFF00'
                  }
                }),
                ...possibleMoves.reduce((acc, square) => ({
                  ...acc,
                  [square]: {
                    background: gameState.chess.get(square as any) 
                      ? 'radial-gradient(circle, rgba(255,0,0,0.3) 85%, transparent 85%)'
                      : 'radial-gradient(circle, rgba(0,0,0,0.2) 25%, transparent 25%)',
                    cursor: 'pointer'
                  }
                }), {})
              }}
              {...(boardSize && { boardWidth: boardSize })}
            />
          </div>

          {gameState.isThinking && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg px-4 py-2 shadow-lg">
                <div className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
                <span className="text-purple-300 text-sm font-medium">
                  {isMobile ? 'Maia analyzing...' : 'Maia is analyzing the position...'}
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
                currentLevel={gameState.aiLevel as import('../types/game').AiLevel}
                currentNodes={gameState.aiNodes as import('../types/game').NodesOption}
                onLevelChange={setAiLevel}
                onNodesChange={setAiNodes}
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
              currentLevel={gameState.aiLevel as import('../types/game').AiLevel}
              currentNodes={gameState.aiNodes as import('../types/game').NodesOption}
              onLevelChange={setAiLevel}
              onNodesChange={setAiNodes}
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