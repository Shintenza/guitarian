import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import KEYS from "./ports.keys";
import { connectPorts } from "./ports.mutations";
import {
  getAvailableConnections,
  getCurrentConnections,
} from "./ports.queries";

export const useAvailableConnections = () => {
  return useQuery({
    queryFn: getAvailableConnections,
    queryKey: [...KEYS.getAvailableConnections],
  });
};

export const useCurrentPortsConnections = () => {
  return useQuery({
    queryFn: getCurrentConnections,
    queryKey: [...KEYS.getCurrentConnections],
  });
};

export const useConnectPorts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: connectPorts,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [...KEYS.getCurrentConnections] });
    },
  });
};
