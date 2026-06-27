import { ChainPlugin } from "@/types/plugins";

export type UseChainReorderParams = {
  indexFrom: number;
  indexTo: number;
};

export type ChainReorderRequest = {
  pluginId: number;
  newPosition: number;
};

export type AddChainItemRequest = {
  pluginUri: string;
  position: number;
};

export type RemoveChainParams = {
  pluginId: number;
};

// TODO fix typing of the id as it is not a string!!!
export type AddChainItemResponse = {
  plugin: ChainPlugin;
};
