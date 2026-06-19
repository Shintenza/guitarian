import { breakpoints } from "./breakpoints";
import { appThemes } from "./palette";

export type Breakpoint = keyof typeof breakpoints;
export type AppBreakpoints = typeof breakpoints;
export type AppThemes = typeof appThemes;

export type Responsive<T> = Partial<Record<keyof AppBreakpoints, T>>;
