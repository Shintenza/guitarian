import { useConfigStore } from "@/stores/config";
import { useEffect, useState } from "react";
import Zeroconf from "react-native-zeroconf";

const zeroconf = new Zeroconf();
const SCAN_TIMEOUT = 10000;

const MDNS_SERVICE_NAME = process.env.EXPO_PUBLIC_MDNS_SERVICE_NAME;
if (!MDNS_SERVICE_NAME) {
  throw new Error("missing EXPO_PUBLIC_MDNS_SERVICE_NAME env");
}

const useFindServer = () => {
  const { connection, setConnection } = useConfigStore();
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    zeroconf.on("resolved", (service) => {
      console.log("RESOLVED", service, MDNS_SERVICE_NAME);
      if (service.name !== MDNS_SERVICE_NAME) return;
      setConnection({ host: service.host, port: service.port });
    });

    zeroconf.scan("http", "tcp", "local.");

    setTimeout(() => {
      zeroconf.stop();
      setIsScanning(false);
    }, SCAN_TIMEOUT);
  }, [setConnection]);

  return { connection, isScanning };
};

export default useFindServer;
