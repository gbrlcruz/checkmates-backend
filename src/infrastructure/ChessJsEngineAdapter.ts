import { Chess } from "chess.js";
import { Board } from "../domain/Board.js";
import { IllegalMoveError } from "../domain/errors/IllegalMoveError.js";
import { Move } from "../domain/Move.js";
import type { PieceType } from "../domain/PieceType.js";
import { Position } from "../domain/Position.js";
import type { ChessEnginePort } from "../domain/ports/ChessEnginePort.js";

const PIECE_TYPE_BY_PROMOTION_LETTER: Record<string, PieceType> = {
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
};

const PROMOTION_LETTER_BY_PIECE_TYPE: Partial<Record<PieceType, string>> = {
  queen: "q",
  rook: "r",
  bishop: "b",
  knight: "n",
};

export class ChessJsEngineAdapter implements ChessEnginePort {
  getLegalMoves(board: Board): Move[] {
    const chess = new Chess(board.toFen());

    return chess
      .moves({ verbose: true })
      .map(
        (move) =>
          new Move(
            Position.fromAlgebraic(move.from),
            Position.fromAlgebraic(move.to),
            move.promotion === undefined
              ? undefined
              : PIECE_TYPE_BY_PROMOTION_LETTER[move.promotion],
          ),
      );
  }

  applyMove(board: Board, move: Move): Board {
    const chess = new Chess(board.toFen());

    try {
      chess.move({
        from: move.from.toAlgebraic(),
        to: move.to.toAlgebraic(),
        promotion:
          move.promotion === undefined ? undefined : PROMOTION_LETTER_BY_PIECE_TYPE[move.promotion],
      });
    } catch {
      throw new IllegalMoveError(move);
    }

    return Board.fromFen(chess.fen());
  }

  isInCheck(board: Board): boolean {
    return new Chess(board.toFen()).inCheck();
  }

  isCheckmate(board: Board): boolean {
    return new Chess(board.toFen()).isCheckmate();
  }

  isStalemate(board: Board): boolean {
    return new Chess(board.toFen()).isStalemate();
  }
}
