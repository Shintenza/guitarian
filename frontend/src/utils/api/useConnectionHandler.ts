import { ConnectionConfig, useConnectionStore } from "@/stores/connection";
import { useCallback, useEffect } from "react";
import { ScannerStatus } from "../connectionScanner/type";
import { useConnectionScanner } from "../connectionScanner/useConnectionScanner";
import { useAppStateChange } from "../useAppStateChange";
import { SocketConnectionState } from "../websocket/types";
import useWebsocket from "../websocket/useWebsocket";

export type UseConnectionHandlerResult = {
  isConnected: boolean;
  isScanning: boolean;
  isConnecting: boolean;
  isPending: boolean;
  isScanningError: boolean;
  isConnectionError: boolean;
  isError: boolean;
  retry: () => void;
  connectAsync: (connection: ConnectionConfig) => Promise<void>;
};

const useConnectionHandler = (): UseConnectionHandlerResult => {
  const { connection, hydrated, setConnection } = useConnectionStore();
  const { disconnect, connect, connectAsync, socketState } = useWebsocket();
  const { scan, service, status } = useConnectionScanner();

  const isScanningError =
    status === ScannerStatus.Timeout || status === ScannerStatus.Error;
  const isConnectionError = socketState === SocketConnectionState.TimedOut;
  const isError = isScanningError || isConnectionError;

  const isScanning = status === ScannerStatus.Searching;
  const isConnecting = Boolean(
    !isError && connection && socketState !== SocketConnectionState.Open,
  );

  const isPending = isScanning || isConnecting;

  const isConnected = socketState === SocketConnectionState.Open;

  const attemptConnection = useCallback(
    (resetAttempts: boolean = false) => {
      if (connection) {
        connect(connection, { resetAttempts });
      } else {
        scan();
      }
    },
    [connect, connection, scan],
  );

  useEffect(() => {
    if (!hydrated || isError || isConnected) {
      return;
    }

    attemptConnection();
  }, [attemptConnection, hydrated, isConnected, isError]);

  useEffect(() => {
    if (service) {
      setConnection({
        host: service.ip,
        port: service.port,
      });
    }
  }, [service, setConnection]);

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
    isConnected,
    isScanning,
    isConnecting,
    isPending,
    isScanningError,
    isConnectionError,
    isError,
    connectAsync,
    retry: () => attemptConnection(true),
  };
};

export default useConnectionHandler;
