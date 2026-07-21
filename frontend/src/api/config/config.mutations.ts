import { apiFetch } from "@/utils/api/fetch";
import { UpdateEngineConfigRequest } from "./types";

export const updateEngineConfig = async (data: UpdateEngineConfigRequest) => {
  await apiFetch("/config", { method: "POST", body: data });
};
