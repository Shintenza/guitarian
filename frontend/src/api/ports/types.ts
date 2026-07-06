export type GetCurrentConnectionsResponse = {
  input: string;
  outputs: string[];
};

export type GetAvailableConnectionsResponse = {
  inputPorts: string[];
  outputDevices: string[];
};

export type ConnectPortsRequest = {
  inputDevicePort: string;
  outputDevices: string[];
};
