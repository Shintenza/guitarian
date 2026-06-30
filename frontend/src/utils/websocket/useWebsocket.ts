import { ConnectionConfig } from "@/stores/connection";
import { useCallback, useEffect, useState } from "react";
import { webSocketClient } from "./WebSocketClient";
import { SocketConnectionState, SocketMessage } from "./types";

const useWebsocket = () => {
  const [socketState, setSocketState] = useState<SocketConnectionState>(
    webSocketClient.getState(),
  );

  const connect = useCallback((connection: ConnectionConfig) => {
    const url = `ws://${connection.host}:${connection.port}/chain/ws`;
    webSocketClient.setUrl(url);
    webSocketClient.connect();
  }, []);

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

  return { socketState, connect, disconnect, sendMessage };
};

export default useWebsocket;
