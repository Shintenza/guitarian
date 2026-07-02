import CHAIN_KEYS from "@/api/chain/chain.keys";
import { usePresetStore } from "@/stores/preset";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import KEYS from "./presets.keys";
import { loadPreset } from "./presets.mutation";
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
