import { useMutation, useQuery } from "@tanstack/react-query";
import KEYS from "./plugins.keys";
import { addPlugin, removeAllPlugins } from "./plugins.mutations";
import { getAllPlugins } from "./plugins.queries";

export const useAllPlugins = () => {
  return useQuery({
    queryFn: getAllPlugins,
    queryKey: [...KEYS.getAllPlugins],
  });
};

export const useAddPlugin = () => {
  return useMutation({
    mutationFn: addPlugin,
  });
};

export const useRemoveAllPlugins = () => {
  return useMutation({
    mutationFn: removeAllPlugins,
  });
};
