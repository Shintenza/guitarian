import { BackButton, Text } from "@/ui/components";
import { useRouter } from "expo-router";
import { ReactNode } from "react";
import { View, ViewProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type SettingsContainerProps = {
  title: string;
  children: ReactNode;
};

export const SettingsContainer = ({
  title,
  children,
}: SettingsContainerProps) => {
  const { back } = useRouter();
  return (
    <View style={sharedStyles.container}>
      <View style={sharedStyles.header}>
        <BackButton onPress={back} />
        <Text size="H1">{title}</Text>
      </View>
      {children}
    </View>
  );
};

type SettingWrapperProps = ViewProps;

export const SettingWrapper = ({ children, ...rest }: SettingWrapperProps) => {
  return (
    <View style={[sharedStyles.settingContainer, rest.style]}>{children}</View>
  );
};

export const sharedStyles = StyleSheet.create((theme) => ({
  container: {
    gap: 12,
    padding: 12,
  },
  header: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },

  settingContainer: {
    padding: 18,
    backgroundColor: theme.colors.background.secondary,
    gap: 12,
    borderRadius: 16,
  },
}));
