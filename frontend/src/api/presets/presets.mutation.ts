import { apiFetch } from "@/utils/api/fetch";
import {
  DeletePresetParams,
  LoadPresetParams,
  LoadPresetResponse,
  SavePresetRequest,
  SavePresetResponse,
} from "./types";

export const loadPreset = async ({ presetId }: LoadPresetParams) => {
  return await apiFetch<LoadPresetResponse>(
    `/presets/preset/${presetId}/load`,
    { method: "POST" },
  );
};

export const savePreset = async (data: SavePresetRequest) => {
  return await apiFetch<SavePresetResponse>("/presets", {
    method: "POST",
    body: data,
  });
};

export const deletePreset = async ({ presetId }: DeletePresetParams) => {
  return await apiFetch(`/presets/preset/${presetId}`, { method: "DELETE" });
};
