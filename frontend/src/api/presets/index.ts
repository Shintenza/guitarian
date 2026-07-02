import CHAIN_KEYS from "@/api/chain/chain.keys";
import { usePresetStore } from "@/stores/preset";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentChain } from "../chain";
import KEYS from "./presets.keys";
import { loadPreset, savePreset } from "./presets.mutation";
import { getAllPresets } from "./presets.queries";

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

export const useSavePreset = () => {
  const queryClient = useQueryClient();
  const { loadPreset } = usePresetStore();
  const { data: chain } = useCurrentChain();

  return useMutation({
    mutationFn: savePreset,
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: [...KEYS.getAllPresets] });
      loadPreset({
        id: 0,
        chain: chain ?? [],
        name: variables.presetName,
      });
    },
  });
};
