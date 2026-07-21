export type GetEngineConfigResponse = {
  sampleRate: number;
  bufferSize: number;
  availableBufferSizes: number[];
};

export type UpdateEngineConfigRequest = {
  bufferSize: number;
};
