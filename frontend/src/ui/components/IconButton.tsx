import MaterialDesignIcons, {
  MaterialDesignIconsIconName,
} from "@react-native-vector-icons/material-design-icons";
import * as Haptics from "expo-haptics";
import { Pressable, ViewStyle } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type IconButtonSize = "regular" | "huge";

type IconButtonProps = {
  iconName: MaterialDesignIconsIconName;
  color?: string;
  onPress: () => void;
  size?: IconButtonSize;
  containerStyle?: ViewStyle;
};

const IconButton = ({
  iconName,
  color,
  size = "regular",
  containerStyle,
  onPress,
}: IconButtonProps) => {
  const { theme } = useUnistyles();

  styles.useVariants({
    size,
  });

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={[styles.container({ color }), containerStyle]}
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
  regular: 12,
  huge: 32,
};

export const styles = StyleSheet.create((theme) => ({
  container: ({ color }: { color?: string }) => ({
    backgroundColor: color ?? theme.colors.orange,
    borderRadius: 1000,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",

    variants: {
      size: {
        regular: {
          padding: 12,
        },
        huge: {
          padding: 20,
        },
      },
    },
  }),
}));

export default IconButton;
