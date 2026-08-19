import { describe, expect, it } from "vitest";
import { Piece } from "../../src/domain/Piece.js";

describe("Piece", () => {
  it("treats two pieces of the same color and type as equal", () => {
    expect(new Piece("white", "knight").equals(new Piece("white", "knight"))).toBe(true);
  });

  it("treats pieces of different colors as not equal", () => {
    expect(new Piece("white", "knight").equals(new Piece("black", "knight"))).toBe(false);
  });

  it("treats pieces of different types as not equal", () => {
    expect(new Piece("white", "knight").equals(new Piece("white", "bishop"))).toBe(false);
  });
});
