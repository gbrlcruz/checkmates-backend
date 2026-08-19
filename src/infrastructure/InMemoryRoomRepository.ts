import type { Room } from "../domain/Room.js";
import type { RoomId } from "../domain/RoomId.js";
import type { RoomRepositoryPort } from "../domain/ports/RoomRepositoryPort.js";

export class InMemoryRoomRepository implements RoomRepositoryPort {
  private readonly rooms = new Map<string, Room>();

  save(room: Room): void {
    this.rooms.set(room.id.toString(), room);
  }

  findById(id: RoomId): Room | undefined {
    return this.rooms.get(id.toString());
  }
}
