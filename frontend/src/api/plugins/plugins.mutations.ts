import { apiFetch } from "@/utils/api/fetch";
import { AddPluginRequest, AddPluginResponse } from "./types";

export const addPlugin = async (data: AddPluginRequest) => {
  const result = await apiFetch<AddPluginResponse>("/chain", {
    body: JSON.stringify(data),
    method: "POST",
  });

  return result.plugin;
};

export const removeAllPlugins = async () => {
  await apiFetch("/chain", { method: "DELETE" });
};
