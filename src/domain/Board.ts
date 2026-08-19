import type { Color } from "./Color.js";
import { Piece } from "./Piece.js";
import type { PieceType } from "./PieceType.js";
import { Position } from "./Position.js";

const BACK_RANK_ORDER: readonly PieceType[] = [
  "rook",
  "knight",
  "bishop",
  "queen",
  "king",
  "bishop",
  "knight",
  "rook",
];
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export class Board {
  private constructor(
    private readonly pieces: ReadonlyMap<string, Piece>,
    readonly turn: Color,
  ) {}

  static startingPosition(): Board {
    const pieces = new Map<string, Piece>();

    FILES.forEach((file, index) => {
      const backRankPiece = BACK_RANK_ORDER[index];

      pieces.set(`${file}1`, new Piece("white", backRankPiece));
      pieces.set(`${file}2`, new Piece("white", "pawn"));
      pieces.set(`${file}7`, new Piece("black", "pawn"));
      pieces.set(`${file}8`, new Piece("black", backRankPiece));
    });

    return new Board(pieces, "white");
  }

  pieceAt(position: Position): Piece | undefined {
    return this.pieces.get(position.toAlgebraic());
  }
}
