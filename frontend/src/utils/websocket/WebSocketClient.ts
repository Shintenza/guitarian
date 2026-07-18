import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";
import {
  ConnectionListener,
  SocketConnectionState,
  SocketMessage,
  WebSocketListener,
} from "./types";

export type ConnectOptions = {
  resetAttempts?: boolean;
  autoReconnect?: boolean;
};

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private url: string | null = null;
  private listeners: Set<WebSocketListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private isIntentionalDisconnect = false;

  private connectionState: SocketConnectionState =
    SocketConnectionState.Disconnected;

  private updateState(state: SocketConnectionState): void {
    this.connectionState = state;
    this.connectionListeners.forEach((listener) => listener(state));
  }

  public connectAsync(
    url: string,
    options: ConnectOptions = {},
  ): Promise<void> {
    const { resetAttempts = false, autoReconnect = true } = options;

    if (resetAttempts) {
      this.reconnectAttempts = 0;
    }

    return new Promise((resolve, reject) => {
      if (this.url === url) {
        if (this.connectionState === SocketConnectionState.Open) {
          return resolve();
        }
        if (this.connectionState === SocketConnectionState.Connecting) {
          return reject(new Error("Already connecting to this URL"));
        }
      }

      if (this.ws) {
        this.disconnect();
      }

      this.url = url;
      this.updateState(SocketConnectionState.Connecting);
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.updateState(SocketConnectionState.Open);
        this.reconnectAttempts = 0;
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        resolve();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const data = camelcaseKeys(JSON.parse(event.data), { deep: true });
          this.listeners.forEach((listener) => listener(data));
        } catch (e) {
          console.error("WebSocket parse error:", e);
        }
      };

      this.ws.onclose = () => {
        const wasConnecting =
          this.connectionState === SocketConnectionState.Connecting;

        this.updateState(SocketConnectionState.Disconnected);
        this.ws = null;

        if (this.isIntentionalDisconnect) {
          this.isIntentionalDisconnect = false;

          if (wasConnecting) {
            reject(new Error("Connection aborted intentionally"));
          }
          return;
        }

        if (
          autoReconnect &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.connectAsync(url, { autoReconnect, resetAttempts: false })
              .then(resolve)
              .catch(reject);
          }, 3000);
        } else {
          this.updateState(SocketConnectionState.TimedOut);
          reject(new Error("WebSocket connection failed"));
        }
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    });
  }

  public connect(
    url: string,
    options: ConnectOptions = { resetAttempts: false, autoReconnect: true },
  ): void {
    const { resetAttempts, autoReconnect } = options;
    this.connectAsync(url, { resetAttempts, autoReconnect }).catch((error) => {
      console.warn(error.message);
    });
  }

  public disconnect() {
    this.isIntentionalDisconnect = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.ws) {
      this.ws.close();
    } else {
      this.updateState(SocketConnectionState.Disconnected);
    }
  }

  public sendMessage(message: SocketMessage): void {
    if (this.ws && this.connectionState === SocketConnectionState.Open) {
      const normalizedMessage = JSON.stringify(
        snakecaseKeys(message, { deep: true }),
      );
      this.ws.send(normalizedMessage);
    }
  }

  public subscribe(listener: WebSocketListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeConnection(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    listener(this.connectionState);

    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  public getState() {
    return this.connectionState;
  }
}

export const webSocketClient = new WebSocketClient();
