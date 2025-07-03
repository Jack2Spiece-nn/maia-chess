declare module 'react-chessboard';
declare module 'lucide-react';

declare module 'chess.js' {
  export class Chess {
    constructor(fen?: string | undefined);
    fen(): string;
    moves(options?: any): any[];
    move(move: any): any;
    get(square: any): any;
    history(options?: any): any[];
    inCheck(): boolean;
    isCheck(): boolean;
    isCheckmate(): boolean;
    isStalemate(): boolean;
    isDraw(): boolean;
    isGameOver(): boolean;
    turn(): 'w' | 'b';
  }
}