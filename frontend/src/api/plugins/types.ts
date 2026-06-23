import { ChainPlugin, EffectClass } from "@/types/plugins";

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

export type AddPluginRequest = {
  plugin_uri: string;
  position: number;
};

export type AddPluginResponse = {
  plugin: ChainPlugin;
};
