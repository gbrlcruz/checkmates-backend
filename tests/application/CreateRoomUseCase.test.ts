import { describe, expect, it } from "vitest";
import { CreateRoomUseCase } from "../../src/application/CreateRoomUseCase.js";
import { InMemoryRoomRepository } from "../../src/infrastructure/InMemoryRoomRepository.js";

describe("CreateRoomUseCase", () => {
  it("creates a room with a fresh id and the starting board", () => {
    const repository = new InMemoryRoomRepository();
    const useCase = new CreateRoomUseCase(repository);

    const room = useCase.execute();

    expect(room.id.toString().length).toBeGreaterThan(0);
    expect(room.board.toFen()).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  });

  it("persists the created room so it can be found later", () => {
    const repository = new InMemoryRoomRepository();
    const useCase = new CreateRoomUseCase(repository);

    const room = useCase.execute();

    expect(repository.findById(room.id)).toBe(room);
  });
});
