import { useCallback, useEffect, useState } from "react";
import { connectionScanner } from "./ConnectionScanner";
import { ScannerStatus, ServiceData } from "./type";

const MDNS_SERVICE_NAME = process.env.EXPO_PUBLIC_MDNS_SERVICE_NAME;
if (!MDNS_SERVICE_NAME) {
  throw new Error("missing EXPO_PUBLIC_MDNS_SERVICE_NAME env");
}

export const useConnectionScanner = () => {
  const [status, setStatus] = useState<ScannerStatus>(
    connectionScanner.getStatus(),
  );
  const [service, setService] = useState<ServiceData | null>(null);

  useEffect(() => {
    const unsubscribe = connectionScanner.subscribe(
      (newStatus, foundService) => {
        setStatus(newStatus);
        if (foundService) setService(foundService);
      },
    );

    return () => {
      unsubscribe();
      connectionScanner.stopScanning();
    };
  }, []);

  const scan = useCallback(() => {
    setService(null);
    connectionScanner.scan(MDNS_SERVICE_NAME);
  }, []);

  const stopScanning = useCallback(() => {
    connectionScanner.stopScanning();
  }, []);

  return { status, service, scan, stopScanning };
};
