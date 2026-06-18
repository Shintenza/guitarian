import { apiFetch } from "@/utils/api/fetch";
import { GetAllPluginsResponse } from "./types";

export const getAllPlugins = async () => {
  const data = await apiFetch<GetAllPluginsResponse>("/plugins", {
    method: "GET",
  });
  return data.plugins;
};
