export const shared = {
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

export const darkModeColors = {
  colors: {
    ...shared,
    background: {
      main: "#121212",
      secondary: "#1E1E1E",
      tertiary: "#2A2A2A",
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

export const lightModeColors = {
  colors: {
    ...shared,
    background: {
      main: "#F4F4F5",
      secondary: "#FFFFFF",
      tertiary: "#E4E4E7",
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

export const appThemes = {
  light: lightModeColors,
  dark: darkModeColors,
};
