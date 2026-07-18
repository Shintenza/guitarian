import { ConnectionConfig } from "@/stores/connection";

export const connectionConfigToWsAddress = (connection: ConnectionConfig) => {
  return `ws://${connection.host}:${connection.port}/chain/ws`;
};

export const connectionConfigToHostAddress = (connection: ConnectionConfig) => {
  return `${connection.host}:${connection.port}`;
};

export const hostAddressToConnectionConfig = (
  address: string,
): ConnectionConfig => {
  const splitAddress = address.split(":");
  const host = splitAddress[0];
  const port = Number.parseInt(splitAddress[1]);

  if (!host || Number.isNaN(port)) {
    throw "Invalid address";
  }

  return {
    host,
    port,
  };
};
