import { useChainStore } from "@/stores/chain";
import { useMutation } from "@tanstack/react-query";
import { addChainItem, clearChain, reorderChain } from "./chain.mutations";
import { AddChainItemRequest, UseChainReorderParams } from "./types";

export const useChainReorder = () => {
  const { moveNode, chain } = useChainStore();

  return useMutation({
    mutationFn: async ({ indexFrom, indexTo }: UseChainReorderParams) => {
      const target = chain[indexFrom];
      console.log("DEBUG: ", {
        chain,
        indexFrom,
        indexTo,
        target,
      });
      moveNode(indexFrom, indexTo);
      await reorderChain({
        pluginId: parseInt(target.id),
        newPosition: indexTo,
      });
    },
    onError: (_, variables) => {
      console.log("no i chuj no i cześć");
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

export const useClearChain = () => {
  const { setChain } = useChainStore();
  return useMutation({
    mutationFn: clearChain,
    onSuccess: () => {
      setChain([]);
    },
  });
};
