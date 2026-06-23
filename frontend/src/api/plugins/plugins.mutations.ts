import { apiFetch } from "@/utils/api/fetch";
import { AddPluginRequest, AddPluginResponse } from "./types";

export const addPlugin = async (data: AddPluginRequest) => {
  const result = await apiFetch<AddPluginResponse>("/plugins", {
    body: JSON.stringify(data),
    method: "POST",
  });

  return result.plugin;
};

export const removeAllPlugins = async () => {
  await apiFetch("/plugins", { method: "DELETE" });
};
