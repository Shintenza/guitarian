import { MaterialDesignIconsIconName } from "@react-native-vector-icons/material-design-icons";

export const EffectsClasses = {
  Distortion: "Distortion",
  Amp: "Amplifier",
  Sim: "Simulator",
  Envelope: "Envelope",
  Gate: "Gate",
} as const;

export type EffectClass = (typeof EffectsClasses)[keyof typeof EffectsClasses];

export type EffectUIConfig = {
  color: string;
  iconName: MaterialDesignIconsIconName;
};
