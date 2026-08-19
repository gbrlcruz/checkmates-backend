import { NO_CASTLING_RIGHTS, type CastlingRights } from "./CastlingRights.js";
import type { Color } from "./Color.js";
import { Piece } from "./Piece.js";
import type { PieceType } from "./PieceType.js";
import { Position } from "./Position.js";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

const BACK_RANK_BY_FILE: readonly [(typeof FILES)[number], PieceType][] = [
  ["a", "rook"],
  ["b", "knight"],
  ["c", "bishop"],
  ["d", "queen"],
  ["e", "king"],
  ["f", "bishop"],
  ["g", "knight"],
  ["h", "rook"],
];

const FEN_LETTER_BY_TYPE: Record<PieceType, string> = {
  pawn: "p",
  knight: "n",
  bishop: "b",
  rook: "r",
  queen: "q",
  king: "k",
};
const TYPE_BY_FEN_LETTER: Record<string, PieceType> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

function fenLetterForPiece(piece: Piece): string {
  const letter = FEN_LETTER_BY_TYPE[piece.type];
  return piece.color === "white" ? letter.toUpperCase() : letter;
}

function pieceForFenLetter(letter: string): Piece {
  const type = TYPE_BY_FEN_LETTER[letter.toLowerCase()];
  if (type === undefined) {
    throw new Error(`Invalid FEN piece letter: "${letter}"`);
  }
  return new Piece(letter === letter.toUpperCase() ? "white" : "black", type);
}

function parseCastlingField(field: string): CastlingRights {
  if (field === "-") {
    return NO_CASTLING_RIGHTS;
  }

  return {
    whiteKingside: field.includes("K"),
    whiteQueenside: field.includes("Q"),
    blackKingside: field.includes("k"),
    blackQueenside: field.includes("q"),
  };
}

function serializeCastlingField(rights: CastlingRights): string {
  const field =
    (rights.whiteKingside ? "K" : "") +
    (rights.whiteQueenside ? "Q" : "") +
    (rights.blackKingside ? "k" : "") +
    (rights.blackQueenside ? "q" : "");

  return field === "" ? "-" : field;
}

export class Board {
  private constructor(
    private readonly pieces: ReadonlyMap<string, Piece>,
    readonly turn: Color,
    readonly castlingRights: CastlingRights,
    readonly enPassantTarget: Position | undefined,
  ) {}

  static startingPosition(): Board {
    const pieces = new Map<string, Piece>();

    BACK_RANK_BY_FILE.forEach(([file, backRankPiece]) => {
      pieces.set(`${file}1`, new Piece("white", backRankPiece));
      pieces.set(`${file}2`, new Piece("white", "pawn"));
      pieces.set(`${file}7`, new Piece("black", "pawn"));
      pieces.set(`${file}8`, new Piece("black", backRankPiece));
    });

    return new Board(
      pieces,
      "white",
      { whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true },
      undefined,
    );
  }

  static fromFen(fen: string): Board {
    const [placement, activeColor, castling, enPassant] = fen.trim().split(/\s+/);
    if (placement === undefined || activeColor === undefined || castling === undefined) {
      throw new Error(`Invalid FEN: "${fen}"`);
    }

    const pieces = new Map<string, Piece>();
    placement.split("/").forEach((rankRow, rowIndex) => {
      const rank = RANKS[rowIndex];
      if (rank === undefined) {
        throw new Error(`Invalid FEN: "${fen}"`);
      }

      let fileIndex = 0;
      for (const char of rankRow) {
        const emptySquares = Number(char);
        if (Number.isInteger(emptySquares) && emptySquares > 0) {
          fileIndex += emptySquares;
          continue;
        }

        const file = FILES[fileIndex];
        if (file === undefined) {
          throw new Error(`Invalid FEN: "${fen}"`);
        }
        pieces.set(`${file}${String(rank)}`, pieceForFenLetter(char));
        fileIndex += 1;
      }
    });

    const turn: Color = activeColor === "b" ? "black" : "white";
    const castlingRights = parseCastlingField(castling);
    const enPassantTarget =
      enPassant === undefined || enPassant === "-" ? undefined : Position.fromAlgebraic(enPassant);

    return new Board(pieces, turn, castlingRights, enPassantTarget);
  }

  toFen(): string {
    const placement = RANKS.map((rank) => {
      let row = "";
      let emptyRun = 0;

      for (const file of FILES) {
        const piece = this.pieces.get(`${file}${String(rank)}`);
        if (piece === undefined) {
          emptyRun += 1;
          continue;
        }

        if (emptyRun > 0) {
          row += String(emptyRun);
          emptyRun = 0;
        }
        row += fenLetterForPiece(piece);
      }

      if (emptyRun > 0) {
        row += String(emptyRun);
      }

      return row;
    }).join("/");

    const activeColor = this.turn === "white" ? "w" : "b";
    const castling = serializeCastlingField(this.castlingRights);
    const enPassant = this.enPassantTarget?.toAlgebraic() ?? "-";

    return `${placement} ${activeColor} ${castling} ${enPassant} 0 1`;
  }

  pieceAt(position: Position): Piece | undefined {
    return this.pieces.get(position.toAlgebraic());
  }
}
