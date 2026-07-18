import { ConnectionConfig } from "@/stores/connection";
import { useCallback, useEffect, useState } from "react";
import { connectionConfigToWsAddress } from "../url";
import { webSocketClient } from "./WebSocketClient";
import { SocketConnectionState, SocketMessage } from "./types";

type ConnectOptions = {
  resetAttempts?: boolean;
};

const useWebsocket = () => {
  const [socketState, setSocketState] = useState<SocketConnectionState>(
    webSocketClient.getState(),
  );

  const connectAsync = useCallback(
    (
      connection: ConnectionConfig,
      options: ConnectOptions = {
        resetAttempts: false,
      },
    ) => {
      return webSocketClient.connectAsync(
        connectionConfigToWsAddress(connection),
        {
          resetAttempts: options.resetAttempts,
        },
      );
    },
    [],
  );

  const connect = useCallback(
    (connection: ConnectionConfig, options?: ConnectOptions) => {
      const { resetAttempts = false } = options ?? {};
      webSocketClient.connect(connectionConfigToWsAddress(connection), {
        resetAttempts,
      });
    },
    [],
  );

  const disconnect = useCallback(() => webSocketClient.disconnect(), []);

  const sendMessage = useCallback(
    (msg: SocketMessage) => webSocketClient.sendMessage(msg),
    [],
  );

  useEffect(() => {
    const unsubscribeConnection = webSocketClient.subscribeConnection((state) =>
      setSocketState(state),
    );

    return () => {
      unsubscribeConnection();
    };
  }, []);

  return { socketState, connect, connectAsync, disconnect, sendMessage };
};

export default useWebsocket;
