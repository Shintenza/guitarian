import { Ref } from "react";
import {
  ColorValue,
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Text } from "./text";

type ButtonVariant = "solid" | "outline";
type ButtonSize = "regular";

type ButtonProps = {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ColorValue;
  ref?: Ref<View>;
  style?: StyleProp<ViewStyle>;
} & PressableProps;

const Button = ({
  title,
  variant,
  size = "regular",
  color,
  style,
  ...rest
}: ButtonProps) => {
  styles.useVariants({
    variant,
    size,
  });

  return (
    <Pressable {...rest} style={[styles.container({ color }), style]}>
      <Text>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: ({ color }: { color?: ColorValue }) => ({
    justifyContent: "center",
    alignItems: "center",
    variants: {
      variant: {
        solid: {
          backgroundColor: color ?? theme.colors.orange,
        },
        outline: {
          borderColor: color ?? theme.colors.orange,
          borderWidth: 2,
        },
      },
      size: {
        regular: {
          borderRadius: 14,
          paddingVertical: 8,
          paddingHorizontal: 12,
        },
      },
    },
  }),
}));

export default Button;
