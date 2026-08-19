import { describe, expect, it } from "vitest";
import { Move } from "../../src/domain/Move.js";
import { Position } from "../../src/domain/Position.js";

describe("Move", () => {
  it("treats moves with the same origin and destination as equal", () => {
    const first = new Move(Position.fromAlgebraic("e2"), Position.fromAlgebraic("e4"));
    const second = new Move(Position.fromAlgebraic("e2"), Position.fromAlgebraic("e4"));

    expect(first.equals(second)).toBe(true);
  });

  it("treats moves with different destinations as not equal", () => {
    const first = new Move(Position.fromAlgebraic("e2"), Position.fromAlgebraic("e4"));
    const second = new Move(Position.fromAlgebraic("e2"), Position.fromAlgebraic("e3"));

    expect(first.equals(second)).toBe(false);
  });

  it("treats moves with different promotion pieces as not equal", () => {
    const first = new Move(Position.fromAlgebraic("a7"), Position.fromAlgebraic("a8"), "queen");
    const second = new Move(Position.fromAlgebraic("a7"), Position.fromAlgebraic("a8"), "knight");

    expect(first.equals(second)).toBe(false);
  });
});
