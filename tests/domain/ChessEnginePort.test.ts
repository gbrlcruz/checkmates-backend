import { describe, expect, it } from "vitest";
import { Board } from "../../src/domain/Board.js";
import { IllegalMoveError } from "../../src/domain/errors/IllegalMoveError.js";
import { Move } from "../../src/domain/Move.js";
import { Position } from "../../src/domain/Position.js";
import { FakeChessEngine } from "../fakes/FakeChessEngine.js";

describe("ChessEnginePort (via FakeChessEngine)", () => {
  const legalMove = new Move(Position.fromAlgebraic("e2"), Position.fromAlgebraic("e4"));
  const illegalMove = new Move(Position.fromAlgebraic("e2"), Position.fromAlgebraic("e5"));
  const startingBoard = Board.startingPosition();
  const resultingBoard = Board.startingPosition();

  it("returns the configured legal moves", () => {
    const engine = new FakeChessEngine({ legalMoves: [legalMove] });

    expect(engine.getLegalMoves(startingBoard)).toEqual([legalMove]);
  });

  it("applies a configured legal move and returns the resulting board", () => {
    const engine = new FakeChessEngine({ legalMoves: [legalMove], resultingBoard });

    expect(engine.applyMove(startingBoard, legalMove)).toBe(resultingBoard);
  });

  it("rejects a move that was not configured as legal", () => {
    const engine = new FakeChessEngine({ legalMoves: [legalMove], resultingBoard });

    expect(() => engine.applyMove(startingBoard, illegalMove)).toThrow(IllegalMoveError);
  });

  it("reports check, checkmate, and stalemate as configured", () => {
    const engine = new FakeChessEngine({ inCheck: true, checkmate: true, stalemate: false });

    expect(engine.isInCheck(startingBoard)).toBe(true);
    expect(engine.isCheckmate(startingBoard)).toBe(true);
    expect(engine.isStalemate(startingBoard)).toBe(false);
  });
});
