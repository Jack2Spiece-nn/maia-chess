import React from 'react';
import { GameStatus } from '../types/game';
import { History, Download } from 'lucide-react';

interface MoveHistoryProps {
  moves: string[];
  gameStatus: GameStatus;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, gameStatus }) => {
  const formatMoves = () => {
    const formatted = [];
    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1] || '';
      formatted.push({ moveNumber, whiteMove, blackMove });
    }
    return formatted;
  };

  const exportPGN = () => {
    const pgnMoves = moves.join(' ');
    const gameResult = gameStatus === 'checkmate' ? 
      (moves.length % 2 === 0 ? '0-1' : '1-0') : 
      gameStatus === 'draw' || gameStatus === 'stalemate' ? '1/2-1/2' : '*';
    
    const pgn = `[Event "Maia Chess Game"]
[Site "Maia Chess Web"]
[Date "${new Date().toISOString().split('T')[0]}"]
[Round "1"]
[White "Player"]
[Black "Maia AI"]
[Result "${gameResult}"]

${pgnMoves} ${gameResult}`;

    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maia-chess-${new Date().toISOString().split('T')[0]}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formattedMoves = formatMoves();

  return (
    <div className="game-panel space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <History className="w-5 h-5" />
          <span>Move History</span>
        </h3>
        {moves.length > 0 && (
          <button
            onClick={exportPGN}
            className="text-sm bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white px-3 py-1 rounded-lg transition-all duration-200 flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>PGN</span>
          </button>
        )}
      </div>

      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg border border-slate-600/50 max-h-64 overflow-y-auto">
        {moves.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No moves yet</p>
          </div>
        ) : (
          <div className="p-3 space-y-1">
            {formattedMoves.map((move, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 py-1 px-2 rounded hover:bg-white/5 transition-colors duration-150"
              >
                <div className="w-6 text-xs text-gray-400 font-mono">
                  {move.moveNumber}.
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="text-sm text-white font-mono">
                    {move.whiteMove}
                  </div>
                  <div className="text-sm text-gray-300 font-mono">
                    {move.blackMove}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {gameStatus !== 'waiting' && gameStatus !== 'playing' && (
        <div className="text-center p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300 font-medium">
            Game ended after {moves.length} moves
          </p>
        </div>
      )}
    </div>
  );
};