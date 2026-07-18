import { useConnection } from "@/contexts/ConnectionProvider";
import { Spinner } from "@/ui/components";
import { useState } from "react";
import { StyleSheet } from "react-native-unistyles";
import { SettingsContainer, SettingWrapper } from "./../shared";
import ConnectionForm from "./components/ConnectionForm";
import ConnectionStatus from "./components/ConnectionStatus";

const ConnectionSettings = () => {
  const { isScanning } = useConnection();
  const [isEditMode, setIsEditMode] = useState(false);

  if (isScanning) {
    return (
      <SettingsContainer title="Connection">
        <SettingWrapper style={styles.loaderContainer}>
          <Spinner size="large" />
        </SettingWrapper>
      </SettingsContainer>
    );
  }

  return (
    <SettingsContainer title="Connection">
      {isEditMode ? (
        <ConnectionForm onCancel={() => setIsEditMode(false)} />
      ) : (
        <ConnectionStatus onEdit={() => setIsEditMode(true)} />
      )}
    </SettingsContainer>
  );
};

const styles = StyleSheet.create((theme) => ({
  loaderContainer: {
    minHeight: 100,
  },
}));

export default ConnectionSettings;
