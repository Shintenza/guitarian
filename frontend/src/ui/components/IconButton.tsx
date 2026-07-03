import { withHaptics } from "@/utils/haptics";
import MaterialDesignIcons, {
  MaterialDesignIconsIconName,
} from "@react-native-vector-icons/material-design-icons";
import { Pressable, PressableProps, ViewStyle } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type IconButtonSize = "tiny" | "regular" | "huge";

type IconButtonProps = {
  iconName: MaterialDesignIconsIconName;
  backgroundColor?: string;
  size?: IconButtonSize;
  containerStyle?: ViewStyle;
  style?: ViewStyle;
  onPress?: () => void;
} & Omit<PressableProps, "style">;

const IconButton = ({
  iconName,
  backgroundColor,
  size = "regular",
  containerStyle,
  onPress,
  ...rest
}: IconButtonProps) => {
  const { theme } = useUnistyles();

  styles.useVariants({
    size,
  });

  return (
    <Pressable
      {...rest}
      onPress={withHaptics(onPress)}
      hitSlop={hitSlop[size]}
      style={[
        styles.container({ backgroundColor }),
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
  container: ({ backgroundColor }: { backgroundColor?: string }) => ({
    backgroundColor: backgroundColor ?? theme.colors.orange,
    borderRadius: 1000,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",

    variants: {
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
