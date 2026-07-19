import { ChainPlugin } from "@/types/plugins";

export const chainWithStringId = (chain: ChainPlugin[]): ChainPlugin[] => {
  return chain.map((item) => ({ ...item, id: `${item.id}` }));
};

export const normalizeChainForComparison = (chain: ChainPlugin[]) => {
  return chain
    .map((plugin) => ({
      id: plugin.id,
      uri: plugin.metadata.uri,
      controlsState: [...plugin.controlsState].sort((a, b) => a.id - b.id),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
};
