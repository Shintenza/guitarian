import { ChainPlugin } from "@/types/plugins";

export type LoadPresetParams = {
  presetId: number;
};

export type LoadPresetResponse = {
  id: number;
  name: string;
  chain: ChainPlugin[];
};

export type SavePresetRequest = {
  presetName: string;
};

export type SavePresetResponse = {
  name: string;
  id: number;
};

export type PresetDetails = {
  id: number;
  name: string;
};

export type GetAllPresetsResponse = {
  presets: PresetDetails[];
};

export type DeletePresetParams = {
  presetId: number;
};

export type UpdatePresetRequest = {
  id: number;
  presetName: string;
  updatePresetChain?: boolean;
};
