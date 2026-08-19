import type { Room } from "../Room.js";
import type { RoomId } from "../RoomId.js";

export interface RoomRepositoryPort {
  save(room: Room): void;
  findById(id: RoomId): Room | undefined;
}
