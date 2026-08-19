import { randomUUID } from "node:crypto";

export class RoomId {
  private constructor(private readonly value: string) {}

  static generate(): RoomId {
    return new RoomId(randomUUID());
  }

  toString(): string {
    return this.value;
  }

  equals(other: RoomId): boolean {
    return this.value === other.value;
  }
}
