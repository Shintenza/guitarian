import { EffectClass, EffectUIConfig } from "./types";

export const effectUI: Record<EffectClass, EffectUIConfig> = {
  Distortion: {
    color: "#ff3b30",
    iconName: "waveform",
  },

  Amplifier: {
    color: "#ff9500",
    iconName: "amplifier",
  },

  Simulator: {
    color: "#5856d6",
    iconName: "chip",
  },

  Envelope: {
    color: "#34c759",
    iconName: "chart-bell-curve",
  },

  Gate: {
    color: "#1c1c1e",
    iconName: "gate",
  },
};

const defaultEffectUI = {
  color: "#999999",
  iconName: "checkbox-blank-circle-outline",
} as const;

export function getEffectUIConfig(effectClass: string): EffectUIConfig {
  if (effectClass in effectUI) {
    return effectUI[effectClass as EffectClass];
  }

  return defaultEffectUI;
}
