import { useConnectionStore } from "@/stores/connection";
import { useEffect, useRef, useState } from "react";
import { ScannerStatus } from "../connectionScanner/type";
import { useConnectionScanner } from "../connectionScanner/useConnectionScanner";
import { useAppStateChange } from "../useAppStateChange";
import { SocketConnectionState } from "../websocket/types";
import useWebsocket from "../websocket/useWebsocket";

export type UseConnectionHandlerResult = {
  isConnected: boolean;
  isConnecting: boolean;
  isError: boolean;
  retry: () => void;
};

const useConnectionHandler = (): UseConnectionHandlerResult => {
  const { connection, hydrated, setConnection } = useConnectionStore();
  const { connect, disconnect, socketState } = useWebsocket();
  const { scan, service, status } = useConnectionScanner();
  const [isError, setIsError] = useState(false);
  const retryCounterRef = useRef(0);

  useEffect(() => {
    if (!hydrated) return;
    if (retryCounterRef.current > 2) {
      setIsError(true);
      return;
    }
    if (connection) {
      connect(connection);
    } else {
      scan();
    }
  }, [connect, connection, hydrated, isError, scan]);

  useEffect(() => {
    if (service) {
      setConnection({
        host: service.ip,
        port: service.port,
      });
    }
  }, [service, setConnection]);

  useEffect(() => {
    if (socketState === SocketConnectionState.TimedOut) {
      setConnection(null);
      retryCounterRef.current++;
    } else if (socketState === SocketConnectionState.Open) {
      retryCounterRef.current = 0;
    }
  }, [setConnection, socketState]);

  useAppStateChange({
    onWake: () => {
      if (connection && !isError) {
        connect(connection);
      }
    },
    onSleep: () => {
      disconnect();
    },
  });

  return {
    isConnected: socketState === SocketConnectionState.Open,
    isConnecting:
      status === ScannerStatus.Searching ||
      socketState === SocketConnectionState.Connecting,
    isError,
    retry: () => {
      retryCounterRef.current = 0;
      setIsError(false);
    },
  };
};

export default useConnectionHandler;
