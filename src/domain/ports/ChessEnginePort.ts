import type { Board } from "../Board.js";
import type { Move } from "../Move.js";

export interface ChessEnginePort {
  getLegalMoves(board: Board): Move[];
  applyMove(board: Board, move: Move): Board;
  isInCheck(board: Board): boolean;
  isCheckmate(board: Board): boolean;
  isStalemate(board: Board): boolean;
}
