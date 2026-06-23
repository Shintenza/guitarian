import { ChainPlugin } from "@/types/plugins";
import { useMemo } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

type ChainState = {
  presetName: string;
  initialChain: ChainPlugin[];
  chain: ChainPlugin[];
  addNode: (plugin: ChainPlugin) => void;
  removeNode: (id: string) => void;
  moveNode: (from: number, to: number) => void;
  clearChain: () => void;
  setChain: (plugins: ChainPlugin[]) => void;
};

export const chainStore = create<ChainState>((set) => ({
  presetName: "New preset",
  initialChain: [],
  chain: [],

  addNode: (plugin) =>
    set((state) => {
      return {
        chain: [...state.chain, plugin],
      };
    }),

  removeNode: (id) =>
    set((state) => ({
      chain: state.chain.filter((node) => node.id !== id),
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
