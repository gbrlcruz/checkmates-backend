import { describe, expect, it } from "vitest";
import { Position } from "../../src/domain/Position.js";

describe("Position", () => {
  it("builds a position from valid algebraic notation", () => {
    const position = Position.fromAlgebraic("e4");

    expect(position.file).toBe("e");
    expect(position.rank).toBe(4);
    expect(position.toAlgebraic()).toBe("e4");
  });

  it.each(["i1", "a9", "a0", "e", "e44", ""])(
    "rejects invalid algebraic notation: %s",
    (invalid) => {
      expect(() => Position.fromAlgebraic(invalid)).toThrow();
    },
  );

  it("treats two positions with the same square as equal", () => {
    expect(Position.fromAlgebraic("d5").equals(Position.fromAlgebraic("d5"))).toBe(true);
  });

  it("treats two positions with different squares as not equal", () => {
    expect(Position.fromAlgebraic("d5").equals(Position.fromAlgebraic("d6"))).toBe(false);
  });
});
