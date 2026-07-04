import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";
import {
  ConnectionListener,
  SocketConnectionState,
  SocketMessage,
  WebSocketListener,
} from "./types";

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private url: string | null = null;
  private listeners: Set<WebSocketListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();
  private reconnectAttempts = 0;
  private maxReconntectAttempts = 3;

  private connectionState: SocketConnectionState =
    SocketConnectionState.Disconnected;

  private updateState(state: SocketConnectionState): void {
    this.connectionState = state;
    this.connectionListeners.forEach((listener) => listener(state));
  }

  public setUrl(url: string): void {
    this.url = url;
  }

  public connect(): void {
    if (this.ws || !this.url) return;
    this.updateState(SocketConnectionState.Connecting);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.updateState(SocketConnectionState.Open);
      this.reconnectAttempts = 0;
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
    };

    this.ws.onmessage = (event: WebSocketMessageEvent) => {
      try {
        const data = camelcaseKeys(JSON.parse(event.data), { deep: true });
        this.listeners.forEach((listener) => listener(data));
      } catch (e) {
        console.error(e);
      }
    };

    this.ws.onclose = () => {
      this.updateState(SocketConnectionState.Disconnected);
      this.ws = null;
      this.reconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconntectAttempts) {
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, 3000);
    } else {
      this.updateState(SocketConnectionState.TimedOut);
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

  public disconnect() {
    this.ws?.close();
    this.updateState(SocketConnectionState.Disconnected);
  }
}

export const webSocketClient = new WebSocketClient();
