import { apiFetch } from "@/utils/api/fetch";
import { GetEngineConfigResponse } from "./types";

export const getEngineConfig = async () => {
  return await apiFetch<GetEngineConfigResponse>("/config", { method: "GET" });
};
