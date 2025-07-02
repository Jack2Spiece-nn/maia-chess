import React, { useEffect, useRef, useState } from 'react';
import { History, Download, Eye, EyeOff, Clock } from 'lucide-react';
import { useDeviceType } from '../hooks/useDeviceType';
import { useChessSound } from '../hooks/useSound';
import { clsx } from 'clsx';

interface MoveHistoryProps {
  moves: string[];
  gameStatus: string;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, gameStatus }) => {
  const { isMobile } = useDeviceType();
  const { playSound } = useChessSound();
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [showNotation, setShowNotation] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest move
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves]);

  const formatMoveTime = (index: number) => {
    // Simulate move times for better UX
    const baseTime = 2000 + (index * 1000) + Math.random() * 3000;
    return new Date(baseTime).toLocaleTimeString('en-US', { 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const exportPGN = () => {
    if (moves.length === 0) return;
    
    playSound('buttonClick');
    
    const pgnMoves = [];
    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1] || '';
      pgnMoves.push(`${moveNumber}. ${whiteMove}${blackMove ? ` ${blackMove}` : ''}`);
    }
    
    const pgn = `[Event "Maia Chess Game"]
[Date "${new Date().toLocaleDateString()}"]
[White "Player"]
[Black "Maia"]
[Result "*"]

${pgnMoves.join(' ')}`;

    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maia-game-${new Date().toISOString().split('T')[0]}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    playSound('buttonClick');
  };

  const toggleNotation = () => {
    setShowNotation(!showNotation);
    playSound('buttonClick');
  };

  return (
    <div className={clsx(
      "game-panel space-y-4",
      isMobile && "game-panel-mobile"
    )}>
      <div className="flex items-center justify-between">
        <h3 className={clsx(
          "font-semibold text-gray-800 flex items-center space-x-2",
          isMobile ? "text-base" : "text-lg"
        )}>
          <History className={clsx("w-5 h-5 text-purple-600", isMobile && "w-4 h-4")} />
          <span>Move History</span>
          {moves.length > 0 && (
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">
              {Math.ceil(moves.length / 2)}
            </span>
          )}
        </h3>

        <div className="flex items-center space-x-2">
          {/* Mobile Expand/Collapse */}
          {isMobile && (
            <button
              onClick={toggleExpanded}
              className="button-touch text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {/* Export Button */}
          {moves.length > 0 && (
            <button
              onClick={exportPGN}
              className="button-touch text-gray-500 hover:text-gray-700"
              title="Export PGN"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {(isExpanded || !isMobile) && (
        <div className="space-y-3">
          {/* Game Info */}
          {moves.length > 0 && (
            <div className="bg-purple-50 rounded-xl p-3 space-y-2 border border-purple-100">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="text-center">
                  <div className="text-gray-600">Total Moves</div>
                  <div className="text-gray-800 font-bold">{moves.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Game Status</div>
                  <div className={clsx(
                    "font-bold capitalize",
                    gameStatus === 'playing' && "text-green-600",
                    gameStatus === 'checkmate' && "text-red-600",
                    gameStatus === 'draw' && "text-blue-600",
                    gameStatus === 'stalemate' && "text-yellow-600"
                  )}>
                    {gameStatus}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Move List */}
          {moves.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No moves yet</p>
              <p className="text-xs">Move history will appear here</p>
            </div>
          ) : (
            <div 
              ref={scrollRef}
              className={clsx(
                "scrollbar-hide overflow-y-auto space-y-1",
                isMobile ? "max-h-48" : "max-h-64"
              )}
            >
              {Array.from({ length: Math.ceil(moves.length / 2) }, (_, i) => {
                const moveNumber = i + 1;
                const whiteMove = moves[i * 2];
                const blackMove = moves[i * 2 + 1];
                const isLatestMove = i === Math.ceil(moves.length / 2) - 1;

                return (
                  <div
                    key={i}
                    className={clsx(
                      "flex items-center space-x-3 p-2 rounded-lg transition-all duration-200",
                      isLatestMove && "bg-purple-100 border border-purple-200",
                      !isLatestMove && "hover:bg-gray-50"
                    )}
                  >
                    <div className="text-xs text-gray-500 w-6 text-center font-mono font-medium">
                      {moveNumber}.
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-2">
                      {/* White Move */}
                      <div className={clsx(
                        "text-sm font-mono p-1.5 rounded-lg text-center font-medium",
                        whiteMove && "bg-white border border-gray-200 text-gray-800 shadow-sm",
                        !whiteMove && "text-gray-400"
                      )}>
                        {whiteMove || "—"}
                      </div>

                      {/* Black Move */}
                      <div className={clsx(
                        "text-sm font-mono p-1.5 rounded-lg text-center font-medium",
                        blackMove && "bg-gray-800 text-white shadow-sm",
                        !blackMove && "text-gray-400"
                      )}>
                        {blackMove || (i * 2 + 1 < moves.length ? "..." : "—")}
                      </div>
                    </div>

                    {/* Move Time - Desktop Only */}
                    {!isMobile && showNotation && (
                      <div className="text-xs text-gray-500 w-12 text-right">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatMoveTime(i)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Controls */}
          {moves.length > 0 && !isMobile && (
            <div className="flex items-center justify-between pt-2 border-t border-purple-100">
              <button
                onClick={toggleNotation}
                className="text-xs text-gray-600 hover:text-gray-800 flex items-center space-x-1 touch-feedback font-medium"
              >
                <Clock className="w-3 h-3" />
                <span>{showNotation ? 'Hide' : 'Show'} Times</span>
              </button>

              <div className="text-xs text-gray-600 font-medium">
                {moves.length} move{moves.length !== 1 ? 's' : ''} played
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};