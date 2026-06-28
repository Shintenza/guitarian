import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";
import { ConnectionListener, SocketMessage, WebSocketListener } from "./types";

class WebSocketClient {
  private ws: WebSocket | null = null;
  public isConnected: boolean = false;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private url: string | null = null;
  private listeners: Set<WebSocketListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();

  private updateStatus(status: boolean): void {
    this.isConnected = status;
    this.connectionListeners.forEach((listener) => listener(status));
  }

  public setUrl(url: string): void {
    this.url = url;
  }

  public connect(): void {
    if (this.ws || !this.url) return;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.updateStatus(true);
      if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
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
      this.updateStatus(false);
      this.ws = null;
      this.reconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private reconnect(): void {
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 3000);
  }

  public sendMessage(message: SocketMessage): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(snakecaseKeys(message, { deep: true })));
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
    listener(this.isConnected);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }
}

export default WebSocketClient;
