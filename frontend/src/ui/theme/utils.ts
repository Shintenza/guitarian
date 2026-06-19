import { UnistylesRuntime } from "react-native-unistyles";
import { Responsive } from "./types";

const BREAKPOINT_ORDER = ["sm", "md", "lg", "xl"] as const;

export function useResponsiveValue<T>(value: Responsive<T>): T {
  const breakpoint = UnistylesRuntime.breakpoint;

  const currentIndex = BREAKPOINT_ORDER.indexOf(
    breakpoint as (typeof BREAKPOINT_ORDER)[number],
  );
  let resolvedValue: T = value["sm"]!;

  for (let i = currentIndex; i >= 0; i--) {
    const bp = BREAKPOINT_ORDER[i];
    resolvedValue = value[bp]!;
  }

  return resolvedValue;
}
