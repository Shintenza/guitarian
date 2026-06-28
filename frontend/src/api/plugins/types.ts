import { EffectClass, Option } from "@/types/plugins";

export type ControlMetadata = {
  id: number;
  name: string;
  defaultValue: number;
  minValue: number;
  maxValue: number;
  scalePoints: Option<number>;
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
