import CHAIN_KEYS from "@/api/chain/chain.keys";
import { usePresetStore } from "@/stores/preset";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useClearChain, useCurrentChain } from "../chain";
import KEYS from "./presets.keys";
import {
  deletePreset,
  loadPreset,
  savePreset,
  updatePreset,
} from "./presets.mutation";
import { getAllPresets } from "./presets.queries";
import { DeletePresetParams } from "./types";

export const useAllPresets = () => {
  return useQuery({
    queryFn: getAllPresets,
    queryKey: [...KEYS.getAllPresets],
  });
};

export const useLoadPreset = () => {
  const queryClient = useQueryClient();
  const { loadPreset: loadPresetToStore } = usePresetStore();
  return useMutation({
    mutationFn: loadPreset,
    onSuccess: (data, variables) => {
      queryClient.refetchQueries({
        queryKey: [...CHAIN_KEYS.GET_CURRENT_CHAIN],
      });
      loadPresetToStore({
        id: variables.presetId,
        name: data.name,
        chain: data.chain,
      });
    },
  });
};

export const useUpdatePreset = () => {
  const queryClient = useQueryClient();
  const { loadPreset } = usePresetStore();
  const { data: chain } = useCurrentChain();

  return useMutation({
    mutationFn: updatePreset,
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: [...KEYS.getAllPresets] });
      loadPreset({
        id: variables.id,
        chain: chain ?? [],
        name: variables.presetName,
      });
    },
  });
};

export const useSavePreset = () => {
  const queryClient = useQueryClient();
  const { loadPreset } = usePresetStore();
  const { data: chain } = useCurrentChain();

  return useMutation({
    mutationFn: savePreset,
    onSuccess: ({ id, name }) => {
      queryClient.refetchQueries({ queryKey: [...KEYS.getAllPresets] });
      loadPreset({
        id,
        chain: chain ?? [],
        name,
      });
    },
  });
};

export const useDeletePreset = () => {
  const { id, loadEmptyPreset } = usePresetStore();
  const { mutateAsync: clearChain } = useClearChain();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ presetId }: DeletePresetParams) => {
      if (presetId === id) {
        await clearChain();
        loadEmptyPreset();
      }

      await deletePreset({ presetId });
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [...KEYS.getAllPresets] });
    },
  });
};
