const ACK_TIMEOUT_MS = 2000;
const VALUE_EPSILON = 0.0001;

type PendingParam = {
  value: number;
  timer: ReturnType<typeof setTimeout>;
};

export type ParamAckFailureListener = (
  pluginId: number,
  portId: number,
) => void;

class ParamAckTracker {
  private pending: Map<string, PendingParam> = new Map();
  private failureListeners: Set<ParamAckFailureListener> = new Set();

  private key(pluginId: number, portId: number): string {
    return `${pluginId}:${portId}`;
  }

  public register(pluginId: number, portId: number, value: number): void {
    const key = this.key(pluginId, portId);
    const existing = this.pending.get(key);
    if (existing) {
      clearTimeout(existing.timer);
    }

    const timer = setTimeout(() => {
      this.pending.delete(key);
      this.failureListeners.forEach((listener) => listener(pluginId, portId));
    }, ACK_TIMEOUT_MS);

    this.pending.set(key, { value, timer });
  }

  public ack(pluginId: number, portId: number, value: number): boolean {
    const key = this.key(pluginId, portId);
    const pending = this.pending.get(key);
    if (!pending) {
      return false;
    }

    if (Math.abs(pending.value - value) > VALUE_EPSILON) {
      console.warn(
        `ParamAckTracker: value mismatch for ${key}, expected ${pending.value}, got ${value}`,
      );
    }

    clearTimeout(pending.timer);
    this.pending.delete(key);
    return true;
  }

  public subscribeFailures(listener: ParamAckFailureListener): () => void {
    this.failureListeners.add(listener);
    return () => {
      this.failureListeners.delete(listener);
    };
  }
}

export const paramAckTracker = new ParamAckTracker();
