import { useQuery } from "@tanstack/react-query";
import KEYS from "./plugins.keys";
import { getAllPlugins } from "./plugins.queries";
import { GetAllPluginsSearchParams } from "./types";

export const useAllPlugins = (params: GetAllPluginsSearchParams = {}) => {
  return useQuery({
    queryFn: () => getAllPlugins(params),
    queryKey: [...KEYS.getAllPlugins, params],
  });
};
