import { useCurrentChain } from "@/api/chain";
import { ChainPlugin } from "@/types/plugins";
import { useMemo } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

type PresetStore = {
  id: string | null;
  name: string;
  originalChainSnapshot: ChainPlugin[] | null;
  loadPreset: ({
    id,
    name,
    chain,
  }: {
    id: string;
    name: string;
    chain: ChainPlugin[];
  }) => void;
};

export const presetStore = create<PresetStore>((set) => ({
  id: null,
  name: "New preset",
  originalChainSnapshot: [],
  loadPreset: ({ id, name, chain }) => {},
}));

export const usePresetStore = () => {
  const { data: currentChain = [] } = useCurrentChain();
  const { name, originalChainSnapshot } = presetStore(
    useShallow((s) => ({
      id: s.id,
      name: s.name,
      originalChainSnapshot: s.originalChainSnapshot,
      loadPreset: s.loadPreset,
    })),
  );

  const isDirty = useMemo(() => {
    const snapshot = originalChainSnapshot || [];

    const currentChainStr = JSON.stringify(currentChain);
    const snapshotStr = JSON.stringify(snapshot);

    return currentChainStr !== snapshotStr;
  }, [currentChain, originalChainSnapshot]);

  return {
    name,
    isDirty,
  };
};
