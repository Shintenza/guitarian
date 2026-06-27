import { useConfigStore } from "@/stores/config";
import { useMutation, useQuery } from "@tanstack/react-query";
import KEYS from "./chain.keys";
import {
  addChainItem,
  clearChain,
  removeChainItem,
  reorderChain,
} from "./chain.mutations";
import { getCurrentChain } from "./chain.queries";
import { AddChainItemRequest, UseChainReorderParams } from "./types";
import { useChainOptimistic } from "./utils";

export const useCurrentChain = () => {
  const { connection } = useConfigStore();
  return useQuery({
    queryFn: getCurrentChain,
    queryKey: [...KEYS.GET_CURRENT_CHAIN],
    enabled: Boolean(connection),
  });
};

export const useChainReorder = () => {
  const { data: chain } = useCurrentChain();
  const { rollback, moveOptimistically } = useChainOptimistic();

  return useMutation({
    mutationFn: async ({ indexFrom, indexTo }: UseChainReorderParams) => {
      if (!chain) return;
      const target = chain[indexFrom];
      await reorderChain({
        pluginId: parseInt(target.id),
        newPosition: indexTo,
      });
    },
    onMutate: ({ indexFrom, indexTo }) =>
      moveOptimistically(indexFrom, indexTo),
    onError: rollback,
  });
};

export const useAppendChainItem = () => {
  const { data: chain } = useCurrentChain();
  const { addOptimistically, rollback } = useChainOptimistic();

  return useMutation({
    mutationFn: ({ pluginUri }: Pick<AddChainItemRequest, "pluginUri">) => {
      return addChainItem({ pluginUri, position: (chain ?? []).length });
    },
    onSuccess: addOptimistically,
    onError: rollback,
  });
};

export const useRemoveChainItem = () => {
  const { removeOptimistically, rollback } = useChainOptimistic();

  return useMutation({
    mutationFn: async ({ pluginId }: { pluginId: string }) => {
      await removeChainItem({ pluginId: parseInt(pluginId) });
    },
    onSuccess: (_, variables) => {
      removeOptimistically(variables.pluginId);
    },
    onError: rollback,
  });
};

export const useClearChain = () => {
  const { setOptimistically } = useChainOptimistic();
  return useMutation({
    mutationFn: clearChain,
    onSuccess: () => {
      setOptimistically([]);
    },
  });
};
