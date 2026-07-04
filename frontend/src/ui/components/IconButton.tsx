import { withHaptics } from "@/utils/haptics";
import MaterialDesignIcons, {
  MaterialDesignIconsIconName,
} from "@react-native-vector-icons/material-design-icons";
import { Pressable, PressableProps, ViewStyle } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type IconButtonSize = "tiny" | "regular" | "huge";

type IconButtonVariant = "solid" | "outline";

type IconButtonProps = {
  iconName: MaterialDesignIconsIconName;
  backgroundColor?: string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  containerStyle?: ViewStyle;
  style?: ViewStyle;
  rounded?: boolean;
  onPress?: () => void;
} & Omit<PressableProps, "style">;

const IconButton = ({
  iconName,
  backgroundColor,
  size = "regular",
  variant = "solid",
  rounded = true,
  containerStyle,
  onPress,
  ...rest
}: IconButtonProps) => {
  const { theme } = useUnistyles();

  styles.useVariants({
    variant,
    size,
  });

  return (
    <Pressable
      {...rest}
      onPress={withHaptics(onPress)}
      hitSlop={hitSlop[size]}
      style={[
        styles.container({ backgroundColor, rounded }),
        containerStyle,
        rest.style,
      ]}
    >
      <MaterialDesignIcons
        name={iconName}
        color={theme.colors.text.primary}
        size={iconSize[size]}
      />
    </Pressable>
  );
};

const iconSize: Record<IconButtonSize, number> = {
  tiny: 13,
  regular: 18,
  huge: 32,
};

const hitSlop: Record<IconButtonSize, number> = {
  tiny: 6,
  regular: 4,
  huge: 0,
};

export const styles = StyleSheet.create((theme) => ({
  container: ({
    backgroundColor,
    rounded,
  }: {
    backgroundColor?: string;
    rounded?: boolean;
  }) => ({
    borderRadius: rounded ? 1000 : 8,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 2,

    variants: {
      variant: {
        solid: {
          borderColor: "transparent",
          backgroundColor: backgroundColor ?? theme.colors.orange,
        },
        outline: {
          borderColor: backgroundColor ?? theme.colors.orange,
        },
      },
      size: {
        tiny: {
          padding: 2,
        },
        regular: {
          padding: 8,
        },
        huge: {
          padding: 20,
        },
      },
    },
  }),
}));

export default IconButton;
