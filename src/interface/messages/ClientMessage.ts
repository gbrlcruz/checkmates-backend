export interface CreateRoomMessage {
  readonly type: "CreateRoom";
}

export type ClientMessage = CreateRoomMessage;
