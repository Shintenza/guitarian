import { useQuery } from "@tanstack/react-query";
import KEYS from "./plugins.keys";
import { getAllPlugins } from "./plugins.queries";

export const useAllPlugins = () => {
  return useQuery({
    queryFn: getAllPlugins,
    queryKey: [...KEYS.getAllPlugins],
  });
};
