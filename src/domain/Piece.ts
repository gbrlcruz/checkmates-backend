import type { Color } from "./Color.js";
import type { PieceType } from "./PieceType.js";

export class Piece {
  constructor(
    readonly color: Color,
    readonly type: PieceType,
  ) {}

  equals(other: Piece): boolean {
    return this.color === other.color && this.type === other.type;
  }
}
