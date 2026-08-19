import type { Move } from "../Move.js";

export class IllegalMoveError extends Error {
  constructor(move: Move) {
    super(`Illegal move: ${move.from.toAlgebraic()} to ${move.to.toAlgebraic()}`);
    this.name = "IllegalMoveError";
  }
}
