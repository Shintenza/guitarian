import { EffectClass } from "@/ui/effects/types";

export type ControlMetadata = {
  id: number;
  name: string;
  defaultValue: number;
  minValue: number;
  maxValue: number;
};

export type PluginMetadata = {
  name: string;
  uri: string;
  class: EffectClass;
  controlsMetadata: ControlMetadata[];
};

export type GetAllPluginsResponse = {
  plugins: PluginMetadata[];
};
