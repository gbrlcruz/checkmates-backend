import type { CreateRoomUseCase } from "../application/CreateRoomUseCase.js";
import type { ClientMessage } from "./messages/ClientMessage.js";
import type { ServerMessage } from "./messages/ServerMessage.js";

function parseClientMessage(raw: string): ClientMessage | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("type" in parsed) ||
    parsed.type !== "CreateRoom"
  ) {
    return undefined;
  }

  return { type: "CreateRoom" };
}

export class RoomConnectionHandler {
  constructor(private readonly createRoomUseCase: CreateRoomUseCase) {}

  handle(raw: string, send: (message: ServerMessage) => void): void {
    const message = parseClientMessage(raw);
    if (message === undefined) {
      console.error(`Unrecognized message: ${raw}`);
      return;
    }

    const room = this.createRoomUseCase.execute();
    send({ type: "RoomCreated", roomId: room.id.toString() });
  }
}
