import { SettingsOption, Text } from "@/ui/components";
import { MaterialDesignIconsIconName } from "@react-native-vector-icons/material-design-icons";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const SETTINGS_SECTION = [
  {
    title: "Audio devices",
    description: "Mange audio connections of the engine",
    iconName: "connection",
    path: "/settings/audio",
  },
  {
    title: "Connection",
    description: "Manage connection with the engine",
    iconName: "web",
    path: "/settings/connection",
  },
  {
    title: "Latency",
    description: "Configure engine latency",
    iconName: "speedometer",
    path: "/settings/latency",
  },
];

const SettingsScreen = () => {
  const { push } = useRouter();
  return (
    <View style={styles.container}>
      <Text size="H1">Settings</Text>
      <View style={styles.sectionsContainer}>
        {SETTINGS_SECTION.map((section) => (
          <SettingsOption
            onPress={() => push(section.path as any)}
            key={section.title}
            {...section}
            iconName={section.iconName as MaterialDesignIconsIconName}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 12,
  },
  sectionsContainer: {
    gap: 8,
  },
});

export default SettingsScreen;
