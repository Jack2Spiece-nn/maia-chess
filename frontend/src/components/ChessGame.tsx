import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessGame } from '../hooks/useChessGame';
import { useDeviceType } from '../hooks/useDeviceType';
import { useChessSound } from '../hooks/useSound';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useValidation } from '../hooks/useValidation';
import { GameControls } from './GameControls';
import { GameStatus } from './GameStatus';
import { MoveHistory } from './MoveHistory';
import { AiSettings } from './AiSettings';
import { SoundSettings } from './SoundSettings';
import { LoadingState } from './LoadingState';
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
  const { metrics, measureTouchLatency, startMonitoring, isMonitoring } = usePerformanceMonitor();
  const haptic = useHapticFeedback();
  const { logAIBehaviorFeedback, logConnectionQuality, logGameSession } = useValidation();
  
  const [lastMove, setLastMove] = useState<string | null>(null);
  const [capturedPiece, setCapturedPiece] = useState<boolean>(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [boardFlipped, setBoardFlipped] = useState<boolean>(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState<boolean>(false);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const [moveCount, setMoveCount] = useState<number>(0);
  const [lastEngineType] = useState<string>('UNKNOWN');

  // Start performance monitoring on mobile devices
  useEffect(() => {
    if (isMobile && !isMonitoring) {
      startMonitoring();
    }
  }, [isMobile, isMonitoring, startMonitoring]);

  // Track connection quality when metrics change
  useEffect(() => {
    if (metrics.lastMoveTime && metrics.networkStatus) {
      logConnectionQuality(metrics.lastMoveTime, metrics.networkStatus);
    }
  }, [metrics.lastMoveTime, metrics.networkStatus, logConnectionQuality]);

  // Track game completion for validation
  useEffect(() => {
    if (gameState.gameStatus !== 'playing' && gameState.gameStatus !== 'waiting' && moveCount > 0) {
      const sessionDuration = Date.now() - gameStartTime;
      logGameSession({
        duration: sessionDuration,
        moveCount,
        aiLevel: gameState.aiLevel,
        completionReason: gameState.gameStatus as any,
        engineType: lastEngineType
      });

      // Log AI behavior feedback after meaningful games
      if (moveCount >= 5) {
        logAIBehaviorFeedback(moveCount, gameState.aiLevel);
      }
    }
  }, [gameState.gameStatus, moveCount, gameStartTime, gameState.aiLevel, logGameSession, logAIBehaviorFeedback]);

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
    // Measure touch latency for mobile performance tracking
    const endTouchMeasurement = isMobile ? measureTouchLatency('chess-move') : null;
    
    // Check if this is a capture move
    const targetPiece = gameState.chess.get(targetSquare as any);
    const isCapture = targetPiece !== null;

    // Make the move synchronously
    try {
      const success = makeMove(sourceSquare, targetSquare);
      
      if (success) {
        // End touch measurement
        if (endTouchMeasurement) endTouchMeasurement();
        
        // Haptic feedback for mobile
        if (isCapture) {
          haptic.pieceCapture();
          playSound('capture');
          setCapturedPiece(true);
          setTimeout(() => setCapturedPiece(false), 600);
        } else {
          haptic.pieceMove();
          playSound('move');
        }
        
        setLastMove(`${sourceSquare}${targetSquare}`);
        setTimeout(() => setLastMove(null), 800);
        setMoveCount(prev => prev + 1);

        // Check for check or checkmate after move
        setTimeout(() => {
          if (gameState.chess.isCheckmate()) {
            haptic.checkmate();
            playSound('checkmate');
          } else if (gameState.chess.isCheck()) {
            haptic.check();
            playSound('check');
          }
        }, 100);
        
        return true;
      } else {
        // Failed move - error haptic feedback
        haptic.error();
      }
    } catch (error) {
      console.error('Move failed:', error);
      haptic.error();
    }

    return false;
  };

  const handleNewGame = (playerColor: any, aiLevel: number) => {
    startNewGame(playerColor, aiLevel);
    haptic.gameStart();
    playSound('gameStart');
    setGameStartTime(Date.now());
    setMoveCount(0);
  };

  const handleResign = () => {
    resignGame();
    haptic.gameEnd();
    playSound('gameEnd');
  };

  // Mobile layout optimization
  const isMobileLayout = isMobile || (isTablet && orientation === 'portrait');

  // Remove problematic JavaScript-based board sizing
  // const boardSize = isMobile 
  //   ? Math.min(window.innerWidth - 32, window.innerHeight - 300)
  //   : isTablet 
  //   ? Math.min(window.innerWidth * 0.6, window.innerHeight - 200)
  //   : undefined;

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
        haptic.pieceSelect();
        setSelectedSquare(square);
        // Get possible moves for the selected piece
        const moves = gameState.chess.moves({ square: square as any, verbose: true });
        setPossibleMoves(moves.map((m: any) => m.to));
      }
    } else {
      // No square selected yet - select if it's our piece
      if (piece && piece.color === gameState.chess.turn()) {
        haptic.pieceSelect();
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
            "mx-auto flex flex-col items-center",
            isMobile ? "chess-board-container-mobile" : "chess-board-container max-w-lg"
          )}>
            <div className="flex justify-between items-center mb-4 w-full">
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
            <div className={clsx(
              "w-full chess-board",
              isMobile ? "chess-board-wrapper-mobile" : "chess-board-wrapper"
            )}>
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
                  borderRadius: '16px',
                  boxShadow: 'none',
                }}
                customDarkSquareStyle={{ 
                  backgroundColor: '#b58863',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                customLightSquareStyle={{ 
                  backgroundColor: '#f0d9b5',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                customDropSquareStyle={{
                  boxShadow: 'inset 0 0 1px 6px rgba(255,255,255,0.75)'
                }}
                customSquareStyles={{
                  ...(selectedSquare && {
                    [selectedSquare]: {
                      backgroundColor: 'rgba(65, 105, 225, 0.4)',
                      border: '2px solid rgba(65, 105, 225, 0.8)',
                      borderRadius: '4px',
                      boxShadow: '0 0 0 1px rgba(65, 105, 225, 0.2)',
                      position: 'relative',
                    }
                  }),
                  ...possibleMoves.reduce((acc, square) => ({
                    ...acc,
                    [square]: {
                      background: gameState.chess.get(square as any) 
                        ? 'radial-gradient(circle, rgba(255, 68, 68, 0.4) 85%, transparent 85%)'
                        : 'radial-gradient(circle, rgba(0, 0, 0, 0.3) 25%, transparent 25%)',
                      cursor: 'pointer',
                      border: gameState.chess.get(square as any) 
                        ? '2px solid rgba(255, 68, 68, 0.6)'
                        : 'none',
                      borderRadius: gameState.chess.get(square as any) ? '50%' : '0',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                    }
                  }), {})
                }}
              />
            </div>
          </div>

          {gameState.isThinking && (
            <div className="mt-4 text-center">
              <LoadingState
                type="thinking"
                message={metrics.networkStatus === 'offline' ? 'Connecting to Maia...' : undefined}
                showDetails={showPerformanceMetrics && isMobile}
                progress={metrics.apiResponseTime ? Math.min(90, (Date.now() % 3000) / 3000 * 100) : undefined}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Performance/Network Status */}
      {isMobile && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
          {/* Network status indicator */}
          <div className={clsx(
            "px-2 py-1 rounded-full text-xs font-medium transition-all duration-300",
            metrics.networkStatus === 'online' && "bg-green-500/20 text-green-300 border border-green-500/30",
            metrics.networkStatus === 'slow' && "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
            metrics.networkStatus === 'offline' && "bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse"
          )}>
            {metrics.networkStatus === 'online' && '●'}
            {metrics.networkStatus === 'slow' && '◐'}
            {metrics.networkStatus === 'offline' && '○'}
          </div>
          
          {/* Performance metrics toggle */}
          <button
            onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
            className="w-6 h-6 bg-slate-700/50 border border-slate-500/30 rounded-full flex items-center justify-center text-xs text-slate-400 hover:text-slate-300"
          >
            ⊕
          </button>
          
          {/* Performance metrics panel */}
          {showPerformanceMetrics && (
            <div className="bg-slate-800/90 border border-slate-600/50 rounded-lg p-2 text-xs text-slate-300 backdrop-blur-sm">
              <div className="space-y-1">
                <div>FPS: {metrics.renderFPS || '--'}</div>
                <div>API: {metrics.lastMoveTime ? `${metrics.lastMoveTime.toFixed(0)}ms` : '--'}</div>
                <div>Touch: {metrics.touchLatency ? `${metrics.touchLatency.toFixed(0)}ms` : '--'}</div>
                <div>Net: {metrics.networkStatus}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Offline Mode Notice */}
      {metrics.networkStatus === 'offline' && (
        <div className="fixed top-20 left-4 right-4 z-50 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span>You're offline. Some features may not work.</span>
          </div>
        </div>
      )}

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