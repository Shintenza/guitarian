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

export const StateChangeEventType = {
  Cleared: "Cleared",
  PresetLoaded: "PresetLoaded",
  PluginLoaded: "PluginLoaded",
  PluginPositionChanged: "PluginPositionChanged",
  PluginUnloaded: "PluginUnloaded",
  ConnectionsChanged: "ConnectionsChanged",
  ParamChanged: "ParamChanged",
  BufferSizeChanged: "BufferSizeChanged",
} as const;

export type StateChangeEventType =
  (typeof StateChangeEventType)[keyof typeof StateChangeEventType];

export type StateChangeEvent =
  | { type: typeof StateChangeEventType.Cleared }
  | {
      type: typeof StateChangeEventType.PresetLoaded;
      payload: { presetId: number };
    }
  | {
      type: typeof StateChangeEventType.PluginLoaded;
      payload: { pluginUri: string; position: number };
    }
  | {
      type: typeof StateChangeEventType.PluginPositionChanged;
      payload: { pluginId: number; newPosition: number };
    }
  | {
      type: typeof StateChangeEventType.PluginUnloaded;
      payload: { pluginId: number };
    }
  | { type: typeof StateChangeEventType.ConnectionsChanged }
  | {
      type: typeof StateChangeEventType.ParamChanged;
      payload: { pluginId: number; portId: number; newValue: number };
    }
  | {
      type: typeof StateChangeEventType.BufferSizeChanged;
      payload: { bufferSize: unknown };
    };

export const isStateChangeEvent = (data: unknown): data is StateChangeEvent => {
  if (typeof data !== "object" || data === null || !("type" in data)) {
    return false;
  }

  return Object.values(StateChangeEventType).includes(
    (data as { type: unknown }).type as StateChangeEventType,
  );
};
