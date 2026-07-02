import { useCurrentChain } from "@/api/chain";
import { ChainPlugin } from "@/types/plugins";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

type PresetStore = {
  id: number | null;
  name: string;
  originalChainSnapshot: ChainPlugin[] | null;
  loadPreset: ({
    id,
    name,
    chain,
  }: {
    id: number;
    name: string;
    chain: ChainPlugin[];
  }) => void;
};

export const presetStore = create<PresetStore>()(
  persist(
    (set) => ({
      id: null,
      name: "New preset",
      originalChainSnapshot: [],

      loadPreset: ({ id, name, chain }) => {
        set({
          id,
          name,
          originalChainSnapshot: chain,
        });
      },
    }),
    {
      name: "preset-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const usePresetStore = () => {
  const { data: currentChain = [] } = useCurrentChain();
  const { id, name, originalChainSnapshot, loadPreset } = presetStore(
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
    id,
    name,
    isDirty,
    loadPreset,
  };
};
