import MaterialDesignIcons, {
  MaterialDesignIconsIconName,
} from "@react-native-vector-icons/material-design-icons";
import * as Haptics from "expo-haptics";
import { Pressable, PressableProps, ViewStyle } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type IconButtonSize = "regular" | "huge";

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
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
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
  regular: 18,
  huge: 32,
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
