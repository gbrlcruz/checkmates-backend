import { describe, expect, it } from "vitest";
import { Board } from "../../src/domain/Board.js";
import { IllegalMoveError } from "../../src/domain/errors/IllegalMoveError.js";
import { Move } from "../../src/domain/Move.js";
import { Position } from "../../src/domain/Position.js";
import { ChessJsEngineAdapter } from "../../src/infrastructure/ChessJsEngineAdapter.js";

describe("ChessJsEngineAdapter", () => {
  const adapter = new ChessJsEngineAdapter();

  describe("legal moves", () => {
    it("lists e2-e4 as a legal opening move for white", () => {
      const legalMoves = adapter.getLegalMoves(Board.startingPosition());
      const e2e4 = new Move(Position.fromAlgebraic("e2"), Position.fromAlgebraic("e4"));

      expect(legalMoves.some((move) => move.equals(e2e4))).toBe(true);
    });

    it("applies a legal move and returns the resulting board", () => {
      const move = new Move(Position.fromAlgebraic("e2"), Position.fromAlgebraic("e4"));
      const result = adapter.applyMove(Board.startingPosition(), move);

      expect(result.pieceAt(Position.fromAlgebraic("e4"))?.type).toBe("pawn");
      expect(result.pieceAt(Position.fromAlgebraic("e2"))).toBeUndefined();
      expect(result.turn).toBe("black");
    });
  });

  describe("illegal moves", () => {
    it("rejects a pawn advancing three squares", () => {
      const move = new Move(Position.fromAlgebraic("e2"), Position.fromAlgebraic("e5"));

      expect(() => adapter.applyMove(Board.startingPosition(), move)).toThrow(IllegalMoveError);
    });

    it("rejects moving out of turn's piece", () => {
      const move = new Move(Position.fromAlgebraic("e7"), Position.fromAlgebraic("e5"));

      expect(() => adapter.applyMove(Board.startingPosition(), move)).toThrow(IllegalMoveError);
    });
  });

  describe("check", () => {
    it("detects a position where the side to move is in check", () => {
      const board = Board.fromFen("4k3/8/8/8/8/8/8/4R2K b - - 0 1");

      expect(adapter.isInCheck(board)).toBe(true);
      expect(adapter.isCheckmate(board)).toBe(false);
      expect(adapter.isStalemate(board)).toBe(false);
    });
  });

  describe("checkmate", () => {
    it("detects a back-rank checkmate", () => {
      const board = Board.fromFen("4R1k1/5ppp/8/8/8/8/8/6K1 b - - 0 1");

      expect(adapter.isCheckmate(board)).toBe(true);
      expect(adapter.isInCheck(board)).toBe(true);
      expect(adapter.isStalemate(board)).toBe(false);
    });
  });

  describe("stalemate", () => {
    it("detects a king with no legal moves and not in check", () => {
      const board = Board.fromFen("k7/8/1Q6/8/8/8/8/7K b - - 0 1");

      expect(adapter.isStalemate(board)).toBe(true);
      expect(adapter.isCheckmate(board)).toBe(false);
      expect(adapter.isInCheck(board)).toBe(false);
    });
  });
});
