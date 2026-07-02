import { apiFetch } from "@/utils/api/fetch";
import { GetAllPresetsResponse } from "./types";

export const getAllPresets = async () => {
  const presets = await apiFetch<GetAllPresetsResponse>("/presets");
  return presets.presets;
};
