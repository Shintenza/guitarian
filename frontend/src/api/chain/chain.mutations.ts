import { apiFetch } from "@/utils/api/fetch";
import {
  AddChainItemRequest,
  AddChainItemResponse,
  ChainReorderRequest,
} from "./types";

export const reorderChain = async (payload: ChainReorderRequest) => {
  console.log("payload", payload);
  await apiFetch("/chain/reorder", {
    method: "POST",
    body: payload,
  });
};

export const addChainItem = async (data: AddChainItemRequest) => {
  const result = await apiFetch<AddChainItemResponse>("/chain", {
    body: data,
    method: "POST",
  });

  return {
    ...result.plugin,
    id: `${result.plugin.id}`,
  };
};

export const removeChainItem = async ({ pluginId }: { pluginId: number }) => {
  await apiFetch(`/chain/item/${pluginId}`, { method: "DELETE" });
};

export const clearChain = async () => {
  await apiFetch("/chain", { method: "DELETE" });
};
