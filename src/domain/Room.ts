import { Board } from "./Board.js";
import { RoomId } from "./RoomId.js";

export class Room {
  private constructor(
    readonly id: RoomId,
    readonly board: Board,
  ) {}

  static create(): Room {
    return new Room(RoomId.generate(), Board.startingPosition());
  }
}
