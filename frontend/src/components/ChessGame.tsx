import React from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessGame } from '../hooks/useChessGame';
import { GameControls } from './GameControls';
import { GameStatus } from './GameStatus';
import { MoveHistory } from './MoveHistory';
import { AiSettings } from './AiSettings';

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

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Don't allow moves if it's not the player's turn or game is over
    if (!gameState.isPlayerTurn || gameState.gameStatus !== 'playing' || gameState.isThinking) {
      return false;
    }

    makeMove(sourceSquare, targetSquare);
    return true;
  };

  const isPlayerWhite = gameState.playerColor === 'white';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chess Board */}
        <div className="lg:col-span-2">
          <div className="game-panel">
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
            
            <div className="chess-board mx-auto max-w-lg">
              <Chessboard
                position={gameState.chess.fen()}
                onPieceDrop={onDrop}
                boardOrientation={isPlayerWhite ? 'white' : 'black'}
                arePiecesDraggable={gameState.isPlayerTurn && gameState.gameStatus === 'playing' && !gameState.isThinking}
                customBoardStyle={{
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }}
                customDarkSquareStyle={{ backgroundColor: '#b58863' }}
                customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                customPremoveOriginDotStyle={{
                  backgroundColor: '#4ecdc4',
                  borderRadius: '50%',
                }}
                customPremoveDestinationDotStyle={{
                  backgroundColor: '#4ecdc4',
                  borderRadius: '50%',
                }}
              />
            </div>

            {gameState.isThinking && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-500/30 rounded-lg px-4 py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span className="text-blue-300 text-sm">Maia is thinking...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game Controls & Info */}
        <div className="space-y-6">
          <GameControls
            gameState={gameState}
            onNewGame={startNewGame}
            onResign={resignGame}
          />
          
          <AiSettings
            currentLevel={gameState.aiLevel}
            onLevelChange={setAiLevel}
            disabled={gameState.gameStatus === 'playing'}
          />
          
          <MoveHistory 
            moves={gameState.moveHistory}
            gameStatus={gameState.gameStatus}
          />
        </div>
      </div>
    </div>
  );
};