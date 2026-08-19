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

    it("has full castling rights for both sides", () => {
      expect(board.castlingRights).toEqual({
        whiteKingside: true,
        whiteQueenside: true,
        blackKingside: true,
        blackQueenside: true,
      });
    });

    it("has no en passant target square", () => {
      expect(board.enPassantTarget).toBeUndefined();
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

  describe("toFen", () => {
    it("serializes the starting position to standard FEN", () => {
      expect(Board.startingPosition().toFen()).toBe(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );
    });
  });

  describe("fromFen", () => {
    it("round-trips the starting position", () => {
      const board = Board.fromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

      expect(board.pieceAt(Position.fromAlgebraic("e1"))?.equals(new Piece("white", "king"))).toBe(
        true,
      );
      expect(board.turn).toBe("white");
      expect(board.castlingRights).toEqual({
        whiteKingside: true,
        whiteQueenside: true,
        blackKingside: true,
        blackQueenside: true,
      });
      expect(board.enPassantTarget).toBeUndefined();
    });

    it("parses partial castling rights", () => {
      const board = Board.fromFen("4k3/8/8/8/8/8/8/4K2R w K - 0 1");

      expect(board.castlingRights).toEqual({
        whiteKingside: true,
        whiteQueenside: false,
        blackKingside: false,
        blackQueenside: false,
      });
    });

    it("parses an en passant target square", () => {
      const board = Board.fromFen("rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 1");

      expect(board.enPassantTarget?.equals(Position.fromAlgebraic("e6"))).toBe(true);
    });

    it("parses black to move", () => {
      const board = Board.fromFen("4k3/8/8/8/8/8/8/4K3 b - - 0 1");

      expect(board.turn).toBe("black");
    });
  });
});
