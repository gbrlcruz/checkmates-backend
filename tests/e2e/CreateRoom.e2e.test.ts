import type { AddressInfo } from "node:net";
import { WebSocket } from "ws";
import { afterEach, describe, expect, it } from "vitest";
import { CreateRoomUseCase } from "../../src/application/CreateRoomUseCase.js";
import { InMemoryRoomRepository } from "../../src/infrastructure/InMemoryRoomRepository.js";
import { startWebSocketServer } from "../../src/infrastructure/websocket/WebSocketServer.js";
import { RoomConnectionHandler } from "../../src/interface/RoomConnectionHandler.js";
import type { ServerMessage } from "../../src/interface/messages/ServerMessage.js";

describe("Create room over WebSocket (end-to-end)", () => {
  let server: ReturnType<typeof startWebSocketServer> | undefined;
  let client: WebSocket | undefined;

  afterEach(() => {
    client?.close();
    server?.close();
  });

  it("returns a room id when a client sends CreateRoom", async () => {
    const repository = new InMemoryRoomRepository();
    const createRoomUseCase = new CreateRoomUseCase(repository);
    const handler = new RoomConnectionHandler(createRoomUseCase);
    server = startWebSocketServer(0, handler);

    await new Promise<void>((resolve) => {
      server?.once("listening", resolve);
    });
    const { port } = server.address() as AddressInfo;

    client = new WebSocket(`ws://localhost:${String(port)}`);
    await new Promise<void>((resolve) => {
      client?.once("open", resolve);
    });

    const response = await new Promise<ServerMessage>((resolve) => {
      client?.once("message", (data: Buffer) => {
        resolve(JSON.parse(data.toString()) as ServerMessage);
      });
      client?.send(JSON.stringify({ type: "CreateRoom" }));
    });

    expect(response.type).toBe("RoomCreated");
    expect((response as { roomId: string }).roomId.length).toBeGreaterThan(0);
  });
});
