import { describe, expect, it } from "vitest";
import { Board } from "../../src/domain/Board.js";
import { Piece } from "../../src/domain/Piece.js";
import { Position } from "../../src/domain/Position.js";

describe("Board", () => {
  describe("startingPosition", () => {
    const board = Board.startingPosition();

    it("has white to move first", () => {
      expect(board.turn).toBe("white");
    });

    it("places the white back rank correctly", () => {
      const backRank: [string, Piece][] = [
        ["a1", new Piece("white", "rook")],
        ["b1", new Piece("white", "knight")],
        ["c1", new Piece("white", "bishop")],
        ["d1", new Piece("white", "queen")],
        ["e1", new Piece("white", "king")],
        ["f1", new Piece("white", "bishop")],
        ["g1", new Piece("white", "knight")],
        ["h1", new Piece("white", "rook")],
      ];

      for (const [square, expected] of backRank) {
        expect(board.pieceAt(Position.fromAlgebraic(square))?.equals(expected)).toBe(true);
      }
    });

    it("places the black back rank correctly", () => {
      const backRank: [string, Piece][] = [
        ["a8", new Piece("black", "rook")],
        ["e8", new Piece("black", "king")],
        ["h8", new Piece("black", "rook")],
      ];

      for (const [square, expected] of backRank) {
        expect(board.pieceAt(Position.fromAlgebraic(square))?.equals(expected)).toBe(true);
      }
    });

    it("places pawns on the second and seventh ranks", () => {
      expect(board.pieceAt(Position.fromAlgebraic("e2"))?.equals(new Piece("white", "pawn"))).toBe(
        true,
      );
      expect(board.pieceAt(Position.fromAlgebraic("e7"))?.equals(new Piece("black", "pawn"))).toBe(
        true,
      );
    });

    it("leaves the middle of the board empty", () => {
      expect(board.pieceAt(Position.fromAlgebraic("e4"))).toBeUndefined();
      expect(board.pieceAt(Position.fromAlgebraic("d5"))).toBeUndefined();
    });
  });
});
