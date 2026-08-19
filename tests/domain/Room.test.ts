import { describe, expect, it } from "vitest";
import { Room } from "../../src/domain/Room.js";

describe("Room", () => {
  it("is created with a fresh id", () => {
    const room = Room.create();

    expect(room.id.toString().length).toBeGreaterThan(0);
  });

  it("gives each created room a different id", () => {
    expect(Room.create().id.equals(Room.create().id)).toBe(false);
  });

  it("starts with the board in the starting position", () => {
    const room = Room.create();

    expect(room.board.toFen()).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  });
});
