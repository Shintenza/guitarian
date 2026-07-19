import { useCurrentChain } from "@/api/chain";
import { ChainPlugin } from "@/types/plugins";
import { chainWithStringId, normalizeChainForComparison } from "@/utils/chain";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

export const EMPTY_PRESET = {
  id: -1,
  name: "New preset",
  chain: [] as ChainPlugin[],
} as const;

type PresetStore = {
  id: number | null;
  name: string;
  originalChainSnapshot: ChainPlugin[] | null;
  loadEmptyPreset: () => void;
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
      id: EMPTY_PRESET.id,
      name: EMPTY_PRESET.name,
      originalChainSnapshot: EMPTY_PRESET.chain,

      loadEmptyPreset: () => {
        set({
          ...EMPTY_PRESET,
        });
      },

      loadPreset: ({ id, name, chain }) => {
        set({
          id,
          name,
          originalChainSnapshot: chainWithStringId(chain),
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
  const { id, name, originalChainSnapshot, loadPreset, loadEmptyPreset } =
    presetStore(
      useShallow((s) => ({
        id: s.id,
        name: s.name,
        originalChainSnapshot: s.originalChainSnapshot,
        loadPreset: s.loadPreset,
        loadEmptyPreset: s.loadEmptyPreset,
      })),
    );

  const isDirty = useMemo(() => {
    const normalizedSnapshot = normalizeChainForComparison(
      originalChainSnapshot || [],
    );
    const normalizedCurrentChain = normalizeChainForComparison(currentChain);

    const currentChainStr = JSON.stringify(normalizedCurrentChain);
    const snapshotStr = JSON.stringify(normalizedSnapshot);
    return currentChainStr !== snapshotStr;
  }, [currentChain, originalChainSnapshot]);

  return {
    id,
    name,
    isDirty,
    loadPreset,
    loadEmptyPreset,
  };
};
