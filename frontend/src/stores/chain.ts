import { PluginMetadata } from "@/api/plugins/types";
import * as Crypto from "expo-crypto";
import { useMemo } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

export type ChainItem = PluginMetadata & {
  id: string;
};

type ChainState = {
  presetName: string;
  initialChain: ChainItem[];
  chain: ChainItem[];
  addNode: (plugin: PluginMetadata) => void;
  removeNode: (uri: string) => void;
  moveNode: (from: number, to: number) => void;
  clearChain: () => void;
  setChain: (plugins: ChainItem[]) => void;
};

export const chainStore = create<ChainState>((set) => ({
  presetName: "New preset",
  initialChain: [],
  chain: [],

  addNode: (plugin) =>
    set((state) => {
      return {
        chain: [...state.chain, { id: Crypto.randomUUID(), ...plugin }],
      };
    }),

  removeNode: (uri) =>
    set((state) => ({
      chain: state.chain.filter((node) => node.uri !== uri),
    })),

  moveNode: (fromIndex: number, toIndex: number) =>
    set((state) => {
      const chain = [...state.chain];

      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= chain.length ||
        toIndex >= chain.length
      ) {
        return state;
      }

      const [moved] = chain.splice(fromIndex, 1);
      chain.splice(toIndex, 0, moved);

      return { chain };
    }),

  setChain: (plugins) =>
    set(() => ({
      chain: plugins,
    })),

  clearChain: () => set({ chain: [] }),
}));

export const useChainStore = () => {
  const store = chainStore(
    useShallow((s) => ({
      presetName: s.presetName,
      initialChain: s.initialChain,
      chain: s.chain,
      addNode: s.addNode,
      removeNode: s.removeNode,
      moveNode: s.moveNode,
      setChain: s.setChain,
    })),
  );

  const isDirty = useMemo(() => {
    const currentChainStr = JSON.stringify(store.chain);
    const initialChainStr = JSON.stringify(store.initialChain);

    return currentChainStr !== initialChainStr;
  }, [store.chain, store.initialChain]);

  return { ...store, isDirty };
};
