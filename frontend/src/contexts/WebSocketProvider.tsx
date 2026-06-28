import { ConnectionConfig } from "@/stores/config";
import { SocketMessage } from "@/utils/websocket/types";
import WebSocketClient from "@/utils/websocket/WebSocketClient";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";

type WebSocketClientContextType = {
  client: WebSocketClient;
  isConnected: boolean;
  connect: (connection: ConnectionConfig) => void;
  sendMessage: (message: SocketMessage) => void;
};

const WebSocketClientContext = createContext<WebSocketClientContextType | null>(
  null,
);

type WebSocketClientProviderProps = {
  client: WebSocketClient;
  children: ReactNode;
};

export const useSocket = () => {
  const context = useContext(WebSocketClientContext);
  if (!context) {
    throw new Error("useSocket must be used inside of WebSocketClientProvider");
  }
  return context;
};

export const WebSocketClientProvider = ({
  client,
  children,
}: WebSocketClientProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(
    (connection: ConnectionConfig) => {
      const url = `ws://${connection.host}:${connection.port}/chain/ws`;
      client.setUrl(url);
      client.connect();
    },
    [client],
  );

  useLayoutEffect(() => {
    const unsubscribeConnection = client.subscribeConnection((isConnected) =>
      setIsConnected(isConnected),
    );
    return () => {
      unsubscribeConnection();
    };
  }, [client]);

  return (
    <WebSocketClientContext.Provider
      value={{
        client,
        isConnected,
        connect,
        sendMessage: client.sendMessage,
      }}
    >
      {children}
    </WebSocketClientContext.Provider>
  );
};
