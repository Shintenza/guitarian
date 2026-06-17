import { Text as RNText } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { typographyConstants } from "../../typography";
import { defaultVariantMap, variantToFontMap } from "./consts";
import { TextProps } from "./types";

const Text = ({
  size = "M",
  variant,
  color,
  style,
  children,
  ...rest
}: TextProps) => {
  const resolvedVariant = variant || defaultVariantMap[size];
  const fontFamily = variantToFontMap[resolvedVariant];
  const { fontSize, lineHeight } = typographyConstants[size];

  return (
    <RNText
      style={[
        styles.base,
        { fontFamily, fontSize, lineHeight },
        color && { color },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create((theme) => ({
  base: {
    color: theme.colors.text.primary,
  },
}));

export default Text;
