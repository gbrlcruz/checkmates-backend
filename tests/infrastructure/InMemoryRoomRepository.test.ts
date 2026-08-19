import { describe, expect, it } from "vitest";
import { Room } from "../../src/domain/Room.js";
import { InMemoryRoomRepository } from "../../src/infrastructure/InMemoryRoomRepository.js";

describe("InMemoryRoomRepository", () => {
  it("returns undefined for a room that was never saved", () => {
    const repository = new InMemoryRoomRepository();
    const room = Room.create();

    expect(repository.findById(room.id)).toBeUndefined();
  });

  it("finds a room by id after saving it", () => {
    const repository = new InMemoryRoomRepository();
    const room = Room.create();

    repository.save(room);

    expect(repository.findById(room.id)).toBe(room);
  });
});
