import { randomUUID } from "node:crypto";

export class RoomId {
  private constructor(private readonly value: string) {}

  static generate(): RoomId {
    return new RoomId(randomUUID());
  }

  static fromString(value: string): RoomId {
    if (value.trim().length === 0) {
      throw new Error("RoomId cannot be empty");
    }
    return new RoomId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: RoomId): boolean {
    return this.value === other.value;
  }
}
