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
          "font-semibold text-white flex items-center space-x-2",
          isMobile ? "text-base" : "text-lg"
        )}>
          <History className={clsx("w-5 h-5", isMobile && "w-4 h-4")} />
          <span>Move History</span>
          {moves.length > 0 && (
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
              {Math.ceil(moves.length / 2)}
            </span>
          )}
        </h3>

        <div className="flex items-center space-x-2">
          {/* Mobile Expand/Collapse */}
          {isMobile && (
            <button
              onClick={toggleExpanded}
              className="button-touch text-gray-400 hover:text-white"
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {/* Export Button */}
          {moves.length > 0 && (
            <button
              onClick={exportPGN}
              className="button-touch text-gray-400 hover:text-white"
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
            <div className="bg-white/5 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="text-center">
                  <div className="text-gray-400">Total Moves</div>
                  <div className="text-white font-semibold">{moves.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Game Status</div>
                  <div className={clsx(
                    "font-semibold capitalize",
                    gameStatus === 'playing' && "text-green-400",
                    gameStatus === 'checkmate' && "text-red-400",
                    gameStatus === 'draw' && "text-blue-400",
                    gameStatus === 'stalemate' && "text-yellow-400"
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
                      isLatestMove && "bg-blue-500/10 border border-blue-500/20",
                      !isLatestMove && "hover:bg-white/5"
                    )}
                  >
                    <div className="text-xs text-gray-400 w-6 text-center font-mono">
                      {moveNumber}.
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-2">
                      {/* White Move */}
                      <div className={clsx(
                        "text-sm font-mono p-1 rounded text-center",
                        whiteMove && "bg-white/10 text-white",
                        !whiteMove && "text-gray-500"
                      )}>
                        {whiteMove || "—"}
                      </div>

                      {/* Black Move */}
                      <div className={clsx(
                        "text-sm font-mono p-1 rounded text-center",
                        blackMove && "bg-gray-800/50 text-gray-200",
                        !blackMove && "text-gray-500"
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
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={toggleNotation}
                className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 touch-feedback"
              >
                <Clock className="w-3 h-3" />
                <span>{showNotation ? 'Hide' : 'Show'} Times</span>
              </button>

              <div className="text-xs text-gray-500">
                {moves.length} move{moves.length !== 1 ? 's' : ''} played
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};