import { breakpoints } from "@/ui/theme/breakpoints";
import { darkModeColors, lightModeColors } from "@/ui/theme/palette";
import { StyleSheet } from "react-native-unistyles";

const appThemes = {
  light: lightModeColors,
  dark: darkModeColors,
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
