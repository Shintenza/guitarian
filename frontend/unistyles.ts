import { StyleSheet } from "react-native-unistyles";

const sharedColors = {
  orange: "#FF7200",
  green: "#388E3C",
  darkOrange: "#E65100",
  purple: "#7B1FA2",
  teal: "#00838F",
  pink: "#C2185B",
  darkGrey: "#424242",
  red: "#D32F2F",
  transparent: "transparent",
} as const;

export const darkTheme = {
  colors: {
    ...sharedColors,
    background: {
      main: "#121212",
      surface: "#1E1E1E",
      elevated: "#2C2C2C",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#A0A0A0",
      muted: "#666666",
    },
    border: "#333333",
    divider: "#2A2A2A",
  },
} as const;

export const lightTheme = {
  colors: {
    ...sharedColors,
    background: {
      main: "#F4F4F5",
      surface: "#FFFFFF",
      elevated: "#E4E4E7",
    },
    text: {
      primary: "#18181B",
      secondary: "#52525B",
      muted: "#A1A1AA",
    },
    border: "#D4D4D8",
    divider: "#A1A1AA",
  },
} as const;

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

const breakpoints = {
  xs: 0,
  sm: 300,
  md: 500,
  lg: 800,
  xl: 1200,
};

type AppBreakpoints = typeof breakpoints;
type AppThemes = typeof appThemes;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: {
    adaptiveThemes: true,
  },
  breakpoints,
  themes: appThemes,
});
