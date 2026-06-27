import { ChainPlugin } from "@/types/plugins";
import { useQueryClient } from "@tanstack/react-query";
import KEYS from "./chain.keys";

export const useChainOptimistic = () => {
  const queryClient = useQueryClient();
  const queryKey = [...KEYS.GET_CURRENT_CHAIN];

  const applyUpdate = async (
    updater: (old: ChainPlugin[]) => ChainPlugin[],
  ) => {
    await queryClient.cancelQueries({ queryKey });
    const previousChain =
      queryClient.getQueryData<ChainPlugin[]>(queryKey) || [];
    queryClient.setQueryData<ChainPlugin[]>(queryKey, updater as any);

    return { previousChain };
  };

  return {
    addOptimistically: (plugin: ChainPlugin) =>
      applyUpdate((old) => [...old, plugin]),

    removeOptimistically: (id: string) =>
      applyUpdate((old) => old.filter((n) => n.id !== id)),

    moveOptimistically: (from: number, to: number) =>
      applyUpdate((old) => {
        const copy = [...old];
        const [moved] = copy.splice(from, 1);
        copy.splice(to, 0, moved);
        return copy;
      }),

    clearOptimistically: () => applyUpdate(() => []),

    setOptimistically: (plugins: ChainPlugin[]) => applyUpdate(() => plugins),

    rollback: (_error: unknown, _variables: unknown, context: any) => {
      if (context?.previousChain) {
        queryClient.setQueryData(queryKey, context.previousChain);
      }
    },

    invalidate: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  };
};
