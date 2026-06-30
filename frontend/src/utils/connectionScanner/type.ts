export const ScannerStatus = {
  Idle: "idle",
  Searching: "searching",
  Found: "found",
  Timeout: "timeout",
  Error: "error",
} as const;

export type ScannerStatus = (typeof ScannerStatus)[keyof typeof ScannerStatus];

export interface ServiceData {
  name: string;
  ip: string;
  port: number;
  raw?: any;
}

export type StatusListener = (
  status: ScannerStatus,
  service?: ServiceData,
) => void;
