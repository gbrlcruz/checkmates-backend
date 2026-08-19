const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export type File = (typeof FILES)[number];
export type Rank = (typeof RANKS)[number];

function isFile(value: string): value is File {
  return (FILES as readonly string[]).includes(value);
}

function isRank(value: number): value is Rank {
  return (RANKS as readonly number[]).includes(value);
}

export class Position {
  private constructor(
    readonly file: File,
    readonly rank: Rank,
  ) {}

  static fromAlgebraic(square: string): Position {
    const file = square.charAt(0);
    const rank = Number(square.slice(1));

    if (square.length !== 2 || !isFile(file) || !isRank(rank)) {
      throw new Error(`Invalid square: "${square}"`);
    }

    return new Position(file, rank);
  }

  toAlgebraic(): string {
    return `${this.file}${String(this.rank)}`;
  }

  equals(other: Position): boolean {
    return this.file === other.file && this.rank === other.rank;
  }
}
