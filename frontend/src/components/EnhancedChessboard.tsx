import React, { useState, useCallback, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedChessboardProps {
  chess: Chess;
  playerColor: 'white' | 'black';
  onMove: (from: string, to: string) => boolean;
  isPlayerTurn: boolean;
  isThinking: boolean;
  lastMove?: { from: string; to: string } | null;
  theme?: 'classic' | 'modern' | 'neon' | 'wood';
  showCoordinates?: boolean;
  showPossibleMoves?: boolean;
}

const themes = {
  classic: {
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    highlight: '#ffdd00',
    possibleMove: '#7dd3fc',
    lastMove: '#9333ea'
  },
  modern: {
    lightSquare: '#edf2f7',
    darkSquare: '#4a5568',
    highlight: '#f6ad55',
    possibleMove: '#68d391',
    lastMove: '#9f7aea'
  },
  neon: {
    lightSquare: '#1a202c',
    darkSquare: '#2d3748',
    highlight: '#00ff41',
    possibleMove: '#00d4ff',
    lastMove: '#ff0080'
  },
  wood: {
    lightSquare: '#deb887',
    darkSquare: '#8b4513',
    highlight: '#ffa500',
    possibleMove: '#90ee90',
    lastMove: '#ff6347'
  }
};

export const EnhancedChessboard: React.FC<EnhancedChessboardProps> = ({
  chess,
  playerColor,
  onMove,
  isPlayerTurn,
  isThinking,
  lastMove,
  theme = 'classic',
  showCoordinates = true,
  showPossibleMoves = true
}) => {
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [premoveSquares, setPremoveSquares] = useState<{ from: string; to: string } | null>(null);

  const currentTheme = themes[theme];

  const onSquareClick = useCallback((square: Square) => {
    if (!isPlayerTurn || isThinking) return;

    // If clicking on already selected square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    // If we have a selected square and clicking on a possible move
    if (selectedSquare && possibleMoves.includes(square)) {
      const moveSuccess = onMove(selectedSquare, square);
      if (moveSuccess) {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
      return;
    }

    // Select new square if it has a piece
    const piece = chess.get(square);
    if (piece && piece.color === (playerColor === 'white' ? 'w' : 'b')) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setPossibleMoves(moves.map(move => move.to));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  }, [chess, selectedSquare, possibleMoves, onMove, isPlayerTurn, isThinking, playerColor]);

  const onPieceDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    if (!isPlayerTurn || isThinking) return false;
    
    const moveSuccess = onMove(sourceSquare, targetSquare);
    if (moveSuccess) {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
    return moveSuccess;
  }, [onMove, isPlayerTurn, isThinking]);

  // Custom square styles
  const getCustomSquareStyles = useCallback(() => {
    const styles: { [square: string]: React.CSSProperties } = {};

    // Highlight last move
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: currentTheme.lastMove,
        opacity: 0.8
      };
      styles[lastMove.to] = {
        backgroundColor: currentTheme.lastMove,
        opacity: 0.8
      };
    }

    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: currentTheme.highlight,
        opacity: 0.9
      };
    }

    // Show possible moves
    if (showPossibleMoves) {
      possibleMoves.forEach(square => {
        if (!styles[square]) {
          styles[square] = {
            background: `radial-gradient(circle, ${currentTheme.possibleMove} 25%, transparent 25%)`,
            borderRadius: '50%'
          };
        }
      });
    }

    return styles;
  }, [lastMove, selectedSquare, possibleMoves, currentTheme, showPossibleMoves]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      {/* Thinking overlay */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-black/20 rounded-xl flex items-center justify-center"
          >
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg px-6 py-3 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="text-white font-medium">Maia is thinking...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="chess-board-enhanced rounded-xl overflow-hidden shadow-2xl">
        <Chessboard
          position={chess.fen()}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick}
          boardOrientation={playerColor}
          arePiecesDraggable={isPlayerTurn && !isThinking}
          customBoardStyle={{
            borderRadius: '12px',
          }}
          customDarkSquareStyle={{ backgroundColor: currentTheme.darkSquare }}
          customLightSquareStyle={{ backgroundColor: currentTheme.lightSquare }}
          customSquareStyles={getCustomSquareStyles()}
          customDropSquareStyle={{
            boxShadow: 'inset 0 0 1px 6px rgba(255,255,255,0.75)'
          }}
          showBoardNotation={showCoordinates}
          boardWidth={Math.min(window.innerWidth - 40, 600)}
        />
      </div>

      {/* Move sound indicator */}
      <AnimatePresence>
        {lastMove && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-4 -right-4 bg-green-500 rounded-full p-2"
          >
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};