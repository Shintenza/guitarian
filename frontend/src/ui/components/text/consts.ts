import { fonts } from "@/ui/typography";
import { TextSize, TextVariant } from "./types";

export const defaultVariantMap: Record<TextSize, TextVariant> = {
  H1: "bold",
  H2: "bold",
  H3: "bold",
  H4: "bold",
  H5: "bold",
  H6: "bold",
  M: "regular",
  S: "regular",
  XS: "regular",
  XXS: "regular",
};

export const variantToFontMap: Record<TextVariant, string> = {
  light: fonts.InterLight,
  regular: fonts.InterRegular,
  medium: fonts.InterMedium,
  semiBold: fonts.InterSemiBold,
  bold: fonts.InterBold,
};
