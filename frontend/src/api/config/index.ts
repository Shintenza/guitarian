import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import KEYS from "./config.keys";
import { updateEngineConfig } from "./config.mutations";
import { getEngineConfig } from "./config.queries";

export const useEngineConfig = () => {
  return useQuery({
    queryKey: [...KEYS.getEngineConfig],
    queryFn: getEngineConfig,
  });
};

export const useUpdateEngineConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEngineConfig,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [...KEYS.getEngineConfig] });
    },
  });
};
