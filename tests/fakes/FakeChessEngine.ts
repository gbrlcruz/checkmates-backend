import type { Board } from "../../src/domain/Board.js";
import { IllegalMoveError } from "../../src/domain/errors/IllegalMoveError.js";
import type { Move } from "../../src/domain/Move.js";
import type { ChessEnginePort } from "../../src/domain/ports/ChessEnginePort.js";

interface FakeChessEngineConfig {
  legalMoves?: Move[];
  resultingBoard?: Board;
  inCheck?: boolean;
  checkmate?: boolean;
  stalemate?: boolean;
}

export class FakeChessEngine implements ChessEnginePort {
  private readonly legalMoves: Move[];
  private readonly resultingBoard: Board | undefined;
  private readonly inCheck: boolean;
  private readonly checkmate: boolean;
  private readonly stalemate: boolean;

  constructor(config: FakeChessEngineConfig = {}) {
    this.legalMoves = config.legalMoves ?? [];
    this.resultingBoard = config.resultingBoard;
    this.inCheck = config.inCheck ?? false;
    this.checkmate = config.checkmate ?? false;
    this.stalemate = config.stalemate ?? false;
  }

  getLegalMoves(_board: Board): Move[] {
    return this.legalMoves;
  }

  applyMove(_board: Board, move: Move): Board {
    const isConfiguredLegal = this.legalMoves.some((legal) => legal.equals(move));

    if (!isConfiguredLegal || this.resultingBoard === undefined) {
      throw new IllegalMoveError(move);
    }

    return this.resultingBoard;
  }

  isInCheck(_board: Board): boolean {
    return this.inCheck;
  }

  isCheckmate(_board: Board): boolean {
    return this.checkmate;
  }

  isStalemate(_board: Board): boolean {
    return this.stalemate;
  }
}
