import { breakpoints } from "@/ui/theme/breakpoints";
import { appThemes } from "@/ui/theme/palette";
import { AppBreakpoints, AppThemes } from "@/ui/theme/types";
import { StyleSheet } from "react-native-unistyles";

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
