import { WebSocketServer as WsServer, type RawData } from "ws";
import type { RoomConnectionHandler } from "../../interface/RoomConnectionHandler.js";
import type { ServerMessage } from "../../interface/messages/ServerMessage.js";

function toMessageString(data: RawData): string {
  if (Buffer.isBuffer(data)) {
    return data.toString();
  }
  if (Array.isArray(data)) {
    return Buffer.concat(data).toString();
  }
  return Buffer.from(data).toString();
}

export function startWebSocketServer(port: number, handler: RoomConnectionHandler): WsServer {
  const server = new WsServer({ port });

  server.on("connection", (socket) => {
    socket.on("message", (data: RawData) => {
      handler.handle(toMessageString(data), (message: ServerMessage) => {
        socket.send(JSON.stringify(message));
      });
    });
  });

  return server;
}
