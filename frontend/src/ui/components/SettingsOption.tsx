import MaterialDesignIcons, {
  MaterialDesignIconsIconName,
} from "@react-native-vector-icons/material-design-icons";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import Text from "./text/Text";

export type SettingsOptionProps = {
  title: string;
  description: string;
  iconName: MaterialDesignIconsIconName;
  onPress?: () => void;
};
const SettingsOption = ({
  title,
  description,
  iconName,
  onPress,
}: SettingsOptionProps) => {
  const { theme } = useUnistyles();
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <MaterialDesignIcons
          name={iconName}
          color={theme.colors.text.primary}
          size={32}
        />
        <View style={styles.column}>
          <Text>{title}</Text>
          <Text size="XS" color={theme.colors.text.secondary}>
            {description}
          </Text>
        </View>
      </View>
      <MaterialDesignIcons
        name="chevron-right"
        color={theme.colors.text.primary}
        size={42}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background.secondary,
    padding: 12,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    gap: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  column: {},
}));

export default SettingsOption;
