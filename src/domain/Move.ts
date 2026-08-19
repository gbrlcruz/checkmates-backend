import type { PieceType } from "./PieceType.js";
import type { Position } from "./Position.js";

export class Move {
  constructor(
    readonly from: Position,
    readonly to: Position,
    readonly promotion?: PieceType,
  ) {}

  equals(other: Move): boolean {
    return (
      this.from.equals(other.from) && this.to.equals(other.to) && this.promotion === other.promotion
    );
  }
}
