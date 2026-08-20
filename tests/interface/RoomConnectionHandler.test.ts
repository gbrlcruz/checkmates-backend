import { describe, expect, it, vi } from "vitest";
import { CreateRoomUseCase } from "../../src/application/CreateRoomUseCase.js";
import { RoomId } from "../../src/domain/RoomId.js";
import { InMemoryRoomRepository } from "../../src/infrastructure/InMemoryRoomRepository.js";
import { RoomConnectionHandler } from "../../src/interface/RoomConnectionHandler.js";
import type { ServerMessage } from "../../src/interface/messages/ServerMessage.js";

function buildHandler() {
  const repository = new InMemoryRoomRepository();
  const createRoomUseCase = new CreateRoomUseCase(repository);
  return { handler: new RoomConnectionHandler(createRoomUseCase), repository };
}

describe("RoomConnectionHandler", () => {
  it("replies with RoomCreated when it receives a CreateRoom message", () => {
    const { handler, repository } = buildHandler();
    const send = vi.fn<(message: ServerMessage) => void>();

    handler.handle(JSON.stringify({ type: "CreateRoom" }), send);

    expect(send).toHaveBeenCalledTimes(1);
    const [message] = send.mock.calls[0] as [ServerMessage];
    expect(message.type).toBe("RoomCreated");

    const roomId = RoomId.fromString((message as { roomId: string }).roomId);
    expect(repository.findById(roomId)).toBeDefined();
  });

  it("does not reply to malformed JSON", () => {
    const { handler } = buildHandler();
    const send = vi.fn<(message: ServerMessage) => void>();

    handler.handle("not json", send);

    expect(send).not.toHaveBeenCalled();
  });

  it("does not reply to an unrecognized message type", () => {
    const { handler } = buildHandler();
    const send = vi.fn<(message: ServerMessage) => void>();

    handler.handle(JSON.stringify({ type: "SomethingElse" }), send);

    expect(send).not.toHaveBeenCalled();
  });
});
