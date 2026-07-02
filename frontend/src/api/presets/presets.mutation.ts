import { apiFetch } from "@/utils/api/fetch";
import { LoadPresetParams, LoadPresetResponse } from "./types";

export const loadPreset = async ({ presetId }: LoadPresetParams) => {
  return await apiFetch<LoadPresetResponse>(
    `/presets/preset/${presetId}/load`,
    { method: "POST" },
  );
};
