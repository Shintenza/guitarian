import { useCurrentChain } from "@/api/chain";
import { useMemo } from "react";

const useChainPlugin = (pluginId: string | null) => {
  const { data: chain = [], ...rest } = useCurrentChain();

  const plugin = useMemo(
    () => chain.find((item) => item.id === pluginId),
    [chain, pluginId],
  );

  return { plugin, ...rest };
};

export default useChainPlugin;
