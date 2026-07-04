import { Ref } from "react";
import {
  ColorValue,
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import Spinner from "./Spinner";
import { Text } from "./text";

type ButtonVariant = "solid" | "outline";
type ButtonSize = "regular";

type ButtonProps = {
  title: string;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ColorValue;
  ref?: Ref<View>;
  style?: StyleProp<ViewStyle>;
} & PressableProps;

const Button = ({
  title,
  variant = "solid",
  size = "regular",
  color,
  style,
  loading,
  ...rest
}: ButtonProps) => {
  const { theme } = useUnistyles();
  styles.useVariants({
    variant,
    size,
  });

  return (
    <Pressable {...rest} style={[styles.container({ color }), style]}>
      {loading && (
        <View style={styles.spinnerContainer}>
          <Spinner
            color={
              variant === "solid"
                ? theme.colors.text.primary
                : (color ?? theme.colors.orange)
            }
          />
        </View>
      )}
      <Text style={{ opacity: loading ? 0 : 1 }}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: ({ color }: { color?: ColorValue }) => ({
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    variants: {
      variant: {
        solid: {
          borderColor: "transparent",
          backgroundColor: color ?? theme.colors.orange,
        },
        outline: {
          borderColor: color ?? theme.colors.orange,
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
  spinnerContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default Button;
