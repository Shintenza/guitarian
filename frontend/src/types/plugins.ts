export const EffectsClasses = {
  Distortion: "Distortion",
  Amp: "Amplifier",
  Sim: "Simulator",
  Envelope: "Envelope",
  Gate: "Gate",
} as const;

export type EffectClass = (typeof EffectsClasses)[keyof typeof EffectsClasses];

export type PluginMetadata = {
  name: string;
  uri: string;
  class: EffectClass;
  controlsMetadata: ControlMetadata[];
};

export type ControlMetadata = {
  id: number;
  name: string;
  defaultValue: number;
  minValue: number;
  maxValue: number;
};

export type ControlState = {
  id: number;
  value: number;
};

export type ChainPlugin = {
  id: string;
  metadata: PluginMetadata;
  controlsState: ControlState[];
};
