import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { useDeviceType } from '../hooks/useDeviceType';
import { clsx } from 'clsx';

interface EnhancedChessboardProps {
  position: string;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  boardOrientation: 'white' | 'black';
  arePiecesDraggable: boolean;
  gameState?: any;
  lastMove?: { from: string; to: string } | null;
  showHints?: boolean;
}

export const EnhancedChessboard: React.FC<EnhancedChessboardProps> = ({
  position,
  onPieceDrop,
  boardOrientation,
  arePiecesDraggable,
  gameState,
  lastMove,
  showHints = true,
}) => {
  const { isMobile, isTablet, isTouch } = useDeviceType();
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [captureSquares, setCaptureSquares] = useState<string[]>([]);
  const [animationKey, setAnimationKey] = useState(0);

  // Create chess instance for move validation
  const chess = React.useMemo(() => {
    const c = new Chess();
    c.load(position);
    return c;
  }, [position]);

  const calculateBoardSize = useCallback(() => {
    if (typeof window === 'undefined') return 500;
    
    if (isMobile) {
      const maxSize = Math.min(
        window.innerWidth - 32,
        window.innerHeight - 300
      );
      return Math.max(280, Math.min(maxSize, 400));
    }
    
    if (isTablet) {
      return Math.min(window.innerWidth * 0.5, 500);
    }
    
    return 500;
  }, [isMobile, isTablet]);

  const [boardSize, setBoardSize] = useState(calculateBoardSize);

  useEffect(() => {
    const handleResize = () => {
      setBoardSize(calculateBoardSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateBoardSize]);

  useEffect(() => {
    // Trigger animation on position change
    setAnimationKey(prev => prev + 1);
  }, [position]);

  const onSquareClick = useCallback((square: Square) => {
    if (!arePiecesDraggable) return;

    const piece = chess.get(square);
    
    if (selectedSquare) {
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null);
        setPossibleMoves([]);
        setCaptureSquares([]);
      } else {
        // Try to make move
        const moveResult = onPieceDrop(selectedSquare, square);
        if (moveResult) {
          setSelectedSquare(null);
          setPossibleMoves([]);
          setCaptureSquares([]);
        } else {
          // Select new piece if it's the player's piece
          if (piece && piece.color === (chess.turn() === 'w' ? 'w' : 'b')) {
            setSelectedSquare(square);
            calculatePossibleMoves(square);
          } else {
            setSelectedSquare(null);
            setPossibleMoves([]);
            setCaptureSquares([]);
          }
        }
      }
    } else {
      // Select piece if it's the player's piece
      if (piece && piece.color === (chess.turn() === 'w' ? 'w' : 'b')) {
        setSelectedSquare(square);
        calculatePossibleMoves(square);
      }
    }
  }, [selectedSquare, chess, onPieceDrop, arePiecesDraggable]);

  const calculatePossibleMoves = useCallback((square: string) => {
    if (!showHints) return;

    const moves = chess.moves({ square: square as Square, verbose: true });
    const moveSquares = moves.map(move => move.to);
    const captures = moves.filter(move => move.captured).map(move => move.to);
    
    setPossibleMoves(moveSquares);
    setCaptureSquares(captures);
  }, [chess, showHints]);

  const customSquareStyles = React.useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};

    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
        boxShadow: 'inset 0 0 0 2px rgba(255, 255, 0, 0.8)',
      };
    }

    // Highlight last move
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(255, 215, 0, 0.3)',
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(255, 215, 0, 0.5)',
      };
    }

    // Highlight possible moves
    possibleMoves.forEach(square => {
      if (!captureSquares.includes(square)) {
        styles[square] = {
          background: 'radial-gradient(circle, rgba(0,255,0,0.3) 20%, transparent 20%)',
        };
      }
    });

    // Highlight capture squares
    captureSquares.forEach(square => {
      styles[square] = {
        background: 'radial-gradient(circle, rgba(255,0,0,0.5) 80%, transparent 80%)',
      };
    });

    return styles;
  }, [selectedSquare, lastMove, possibleMoves, captureSquares]);

  const customDropSquareStyle = React.useMemo(() => ({
    boxShadow: 'inset 0 0 1px 4px rgb(255,255,255)',
  }), []);

  const customDarkSquareStyle = React.useMemo(() => ({
    backgroundColor: '#b58863',
    ...(isTouch && { cursor: 'pointer' }),
  }), [isTouch]);

  const customLightSquareStyle = React.useMemo(() => ({
    backgroundColor: '#f0d9b5',
    ...(isTouch && { cursor: 'pointer' }),
  }), [isTouch]);

  const customBoardStyle = React.useMemo(() => ({
    borderRadius: isMobile ? '8px' : '12px',
    boxShadow: isMobile 
      ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 5px 10px -5px rgba(0, 0, 0, 0.04)'
      : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  }), [isMobile]);

  return (
    <div 
      className={clsx(
        "relative mx-auto transition-all duration-300",
        isMobile ? "chess-board-mobile" : "chess-board"
      )}
      key={animationKey}
    >
      {/* Touch overlay for mobile interactions */}
      {isTouch && (
        <div className="absolute inset-0 z-10 pointer-events-none" />
      )}

      <Chessboard
        position={position}
        boardWidth={boardSize}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
        boardOrientation={boardOrientation}
        arePiecesDraggable={arePiecesDraggable}
        customBoardStyle={customBoardStyle}
        customDarkSquareStyle={customDarkSquareStyle}
        customLightSquareStyle={customLightSquareStyle}
        customDropSquareStyle={customDropSquareStyle}
        customSquareStyles={customSquareStyles}
        customPremoveOriginDotStyle={{
          backgroundColor: '#4ecdc4',
          borderRadius: '50%',
        }}
        customPremoveDestinationDotStyle={{
          backgroundColor: '#4ecdc4',
          borderRadius: '50%',
        }}
        areArrowsAllowed={!isMobile}
        showBoardNotation={!isMobile}
        animationDuration={isMobile ? 150 : 200}
        snapToCursor={isTouch}
      />

      {/* Move indicators */}
      {selectedSquare && possibleMoves.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {possibleMoves.length} moves available
        </div>
      )}

      {/* Game state indicator */}
      {gameState?.chess?.isCheck() && (
        <div className="absolute top-2 left-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded animate-pulse">
          Check!
        </div>
      )}

      {/* Mobile hint */}
      {isMobile && arePiecesDraggable && (
        <div className="absolute bottom-2 right-2 bg-blue-500/80 text-white text-xs px-2 py-1 rounded">
          Tap to select
        </div>
      )}
    </div>
  );
};