import { typographyConstants } from "@/ui/typography";
import { TextProps as RNTextProps } from "react-native";

export type TextSize = keyof typeof typographyConstants;
export type TextVariant = "light" | "regular" | "medium" | "semiBold" | "bold";

export type TextProps = {
  size?: TextSize;
  variant?: TextVariant;
  color?: string;
} & RNTextProps;
