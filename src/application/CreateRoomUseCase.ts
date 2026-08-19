import { Room } from "../domain/Room.js";
import type { RoomRepositoryPort } from "../domain/ports/RoomRepositoryPort.js";

export class CreateRoomUseCase {
  constructor(private readonly rooms: RoomRepositoryPort) {}

  execute(): Room {
    const room = Room.create();
    this.rooms.save(room);
    return room;
  }
}
