import { describe, expect, it } from "vitest";
import { RoomId } from "../../src/domain/RoomId.js";

describe("RoomId", () => {
  it("generates a non-empty id", () => {
    expect(RoomId.generate().toString().length).toBeGreaterThan(0);
  });

  it("generates unique ids", () => {
    expect(RoomId.generate().equals(RoomId.generate())).toBe(false);
  });

  it("treats two ids with the same value as equal", () => {
    const id = RoomId.generate();

    expect(id.equals(id)).toBe(true);
  });

  it("round-trips through fromString", () => {
    const id = RoomId.generate();

    expect(RoomId.fromString(id.toString()).equals(id)).toBe(true);
  });

  it.each(["", "   "])("rejects an empty id string: %j", (invalid) => {
    expect(() => RoomId.fromString(invalid)).toThrow();
  });
});
