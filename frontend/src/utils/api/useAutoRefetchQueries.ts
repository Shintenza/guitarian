import CHAIN_KEYS from "@/api/chain/chain.keys";
import PORTS_KEYS from "@/api/ports/ports.keys";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type UseAutoRefetchQueriesParams = {
  isConnected: boolean;
};

const QUERIES_TO_REFETCH = [
  CHAIN_KEYS.GET_CURRENT_CHAIN,
  PORTS_KEYS.getCurrentConnections,
  PORTS_KEYS.getAvailableConnections,
];

const TARGET_QUERY_HASHES = QUERIES_TO_REFETCH.map((key) =>
  JSON.stringify(key),
);

const useAutoRefetchQueries = ({
  isConnected,
}: UseAutoRefetchQueriesParams) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isConnected) return;

    queryClient.refetchQueries({
      predicate: (query) => {
        const currentQueryHash = JSON.stringify(query.queryKey);
        const isInRefreshList = TARGET_QUERY_HASHES.includes(currentQueryHash);

        const hasData = query.state.status === "success";

        return isInRefreshList && hasData;
      },
    });
  }, [isConnected, queryClient]);
};

export default useAutoRefetchQueries;
