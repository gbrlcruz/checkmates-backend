import { CreateRoomUseCase } from "./application/CreateRoomUseCase.js";
import { InMemoryRoomRepository } from "./infrastructure/InMemoryRoomRepository.js";
import { startWebSocketServer } from "./infrastructure/websocket/WebSocketServer.js";
import { RoomConnectionHandler } from "./interface/RoomConnectionHandler.js";

const port = Number(process.env.PORT ?? 8080);

const roomRepository = new InMemoryRoomRepository();
const createRoomUseCase = new CreateRoomUseCase(roomRepository);
const roomConnectionHandler = new RoomConnectionHandler(createRoomUseCase);

startWebSocketServer(port, roomConnectionHandler);

console.log(`CheckMates WebSocket server listening on port ${String(port)}`);
