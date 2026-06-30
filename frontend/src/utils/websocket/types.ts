export type WebSocketListener = (data: unknown) => void;
export type ConnectionListener = (state: SocketConnectionState) => void;

const SocketActions = {
  SetParam: "SetParam",
} as const;

export type SocketAction = (typeof SocketActions)[keyof typeof SocketActions];

type SocketActionMessageBase<T extends SocketAction> = {
  action: T;
};

export type SetParamMessage = SocketActionMessageBase<"SetParam"> & {
  pluginId: number;
  portId: number;
  value: number;
};

export const SocketConnectionState = {
  Disconnected: "disconnected",
  Connecting: "connecting",
  Open: "open",
  TimedOut: "timedOut",
} as const;

export type SocketConnectionState =
  (typeof SocketConnectionState)[keyof typeof SocketConnectionState];

export type SocketMessage = SetParamMessage;
