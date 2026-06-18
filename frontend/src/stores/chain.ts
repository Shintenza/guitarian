import { PluginMetadata } from "@/api/plugins/types";
import { create } from "zustand";

type ChainState = {
  chain: PluginMetadata[];
  addNode: (plugin: PluginMetadata) => void;
  removeNode: (uri: string) => void;
  moveNode: (fromIndex: number, toIndex: number) => void;
  clearChain: () => void;
};

export const useChainStore = create<ChainState>((set) => ({
  chain: [],

  addNode: (plugin) =>
    set((state) => {
      return {
        chain: [...state.chain, plugin],
      };
    }),

  removeNode: (uri) =>
    set((state) => ({
      chain: state.chain.filter((node) => node.uri !== uri),
    })),

  moveNode: (fromIndex, toIndex) =>
    set((state) => {
      const newChain = [...state.chain];
      const [movedNode] = newChain.splice(fromIndex, 1);
      newChain.splice(toIndex, 0, movedNode);

      return { chain: newChain };
    }),

  clearChain: () => set({ chain: [] }),
}));
