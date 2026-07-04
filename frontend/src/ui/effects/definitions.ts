import { EffectClass } from "@/types/plugins";
import { EffectUIConfig } from "./types";

export const effectUI: Record<EffectClass, EffectUIConfig> = {
  simulator: {
    color: "#5856d6",
    iconName: "chip",
  },

  amplifier: {
    color: "#ff9500",
    iconName: "amplifier",
  },

  distortion: {
    color: "#ff3b30",
    iconName: "waveform",
  },

  envelope: {
    color: "#34c759",
    iconName: "chart-bell-curve",
  },

  gate: {
    color: "#d900b1",
    iconName: "gate",
  },

  eq: {
    color: "#5ac8fa",
    iconName: "equalizer",
  },

  chorus: {
    color: "#ffcc00",
    iconName: "music",
  },

  modulator: {
    color: "#ff2d55",
    iconName: "rotate-3d",
  },

  compressor: {
    color: "#ff9f0a",
    iconName: "arrow-collapse-all",
  },

  delay: {
    color: "#007aff",
    iconName: "timer",
  },

  pitch_shifter: {
    color: "#af52de",
    iconName: "music-note",
  },

  expander: {
    color: "#30d158",
    iconName: "arrow-expand",
  },

  flanger: {
    color: "#64d2ff",
    iconName: "waves",
  },

  filter: {
    color: "#ffd60a",
    iconName: "filter",
  },

  reverb: {
    color: "#0a84ff",
    iconName: "home-analytics",
  },

  phaser: {
    color: "#bf5af2",
    iconName: "orbit",
  },

  utility: {
    color: "#8e8e93",
    iconName: "cog",
  },

  other: {
    color: "#48484a",
    iconName: "help-circle",
  },
} as const;

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
