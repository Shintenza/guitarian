export type WebSocketListener = () => void;
export type ConnectionListener = (isConnected: boolean) => void;

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

export type SocketMessage = SetParamMessage;
