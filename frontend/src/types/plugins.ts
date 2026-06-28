export type Option<T> = {
  label: string;
  value: T;
};

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

export const ControlTypes = {
  Continuous: "Continuous",
  Integer: "Integer",
  Toggled: "Toggled",
  Enumeration: "Enumeration",
} as const;

export type ControlType = (typeof ControlTypes)[keyof typeof ControlTypes];

export type ControlMetadata = {
  id: number;
  name: string;
  defaultValue: number;
  controlType: ControlType;
  minValue: number;
  maxValue: number;
  scalePoints: Option<number>[];
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
