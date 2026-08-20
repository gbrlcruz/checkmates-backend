export interface RoomCreatedMessage {
  readonly type: "RoomCreated";
  readonly roomId: string;
}

export type ServerMessage = RoomCreatedMessage;
