import Zeroconf from "react-native-zeroconf";
import { ScannerStatus, ServiceData, StatusListener } from "./type";

export class ConnectionScanner {
  private status: ScannerStatus = ScannerStatus.Idle;
  private listeners: Set<StatusListener> = new Set();
  private timeoutId: NodeJS.Timeout | null = null;

  private zeroconf: Zeroconf;
  private targetServiceName: string = "";

  constructor() {
    this.zeroconf = new Zeroconf();

    this.zeroconf.on("resolved", this.handleResolved);
    this.zeroconf.on("error", this.handleError);
  }

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateStatus(newStatus: ScannerStatus, service?: ServiceData) {
    this.status = newStatus;
    this.listeners.forEach((listener) => listener(newStatus, service));
  }

  public getStatus(): ScannerStatus {
    return this.status;
  }

  public scan(serviceName: string, timeoutMs: number = 10000) {
    if (this.status === ScannerStatus.Searching) {
      return;
    }

    this.targetServiceName = serviceName;
    this.updateStatus(ScannerStatus.Searching);

    this.zeroconf.scan("http", "tcp", "local.");

    this.timeoutId = setTimeout(() => {
      this.stopScanning();
      this.updateStatus(ScannerStatus.Timeout);
    }, timeoutMs);
  }

  public stopScanning() {
    this.clearTimers();
    if (this.status === ScannerStatus.Searching) {
      this.zeroconf.stop();
      this.updateStatus(ScannerStatus.Idle);
    }
  }

  private handleResolved = (service: any) => {
    if (service.name === this.targetServiceName) {
      this.handleServiceFound({
        name: service.name,
        ip: service.addresses?.[0] || "unknown",
        port: service.port,
        raw: service,
      });
    }
  };

  private handleError = (err: any) => {
    this.stopScanning();
    this.updateStatus(ScannerStatus.Error);
  };

  private handleServiceFound(service: ServiceData) {
    this.clearTimers();
    this.zeroconf.stop();
    this.updateStatus(ScannerStatus.Found, service);
  }

  private clearTimers() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export const connectionScanner = new ConnectionScanner();
