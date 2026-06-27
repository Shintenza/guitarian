import { useChainStore } from "@/stores/chain";
import { useMutation } from "@tanstack/react-query";
import {
  addChainItem,
  clearChain,
  removeChainItem,
  reorderChain,
} from "./chain.mutations";
import { AddChainItemRequest, UseChainReorderParams } from "./types";

export const useChainReorder = () => {
  const { moveNode, chain } = useChainStore();

  return useMutation({
    mutationFn: async ({ indexFrom, indexTo }: UseChainReorderParams) => {
      const target = chain[indexFrom];
      moveNode(indexFrom, indexTo);
      await reorderChain({
        pluginId: parseInt(target.id),
        newPosition: indexTo,
      });
    },
    onError: (_, variables) => {
      moveNode(variables.indexTo, variables.indexFrom);
    },
  });
};

export const useAppendChainItem = () => {
  const { addNode, chain } = useChainStore();

  return useMutation({
    mutationFn: ({ pluginUri }: Pick<AddChainItemRequest, "pluginUri">) => {
      return addChainItem({ pluginUri, position: chain.length });
    },
    onSuccess: (data) => {
      addNode(data);
    },
  });
};

export const useRemoveChainItem = () => {
  const { removeNode } = useChainStore();

  return useMutation({
    mutationFn: async ({ pluginId }: { pluginId: string }) => {
      await removeChainItem({ pluginId: parseInt(pluginId) });
    },
    onSuccess: (_, variables) => {
      removeNode(variables.pluginId);
    },
  });
};

export const useClearChain = () => {
  const { setChain } = useChainStore();
  return useMutation({
    mutationFn: clearChain,
    onSuccess: () => {
      setChain([]);
    },
  });
};
