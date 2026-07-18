import { useConnection } from "@/contexts/ConnectionProvider";
import { useConnectionStore } from "@/stores/connection";
import { Button, StatusPill, Text } from "@/ui/components";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { SettingWrapper } from "../../shared";

type ConnectionStatusProps = {
  onEdit: () => void;
};

const ConnectionStatus = ({ onEdit }: ConnectionStatusProps) => {
  const { theme } = useUnistyles();
  const { isConnected } = useConnection();
  const { connection } = useConnectionStore();
  const states = {
    Connected: theme.colors.green,
    Disconnected: theme.colors.red,
  };

  const address = connection
    ? `${connection.host}:${connection.port}`
    : "Device address not found";

  return (
    <>
      <SettingWrapper>
        <View style={styles.row}>
          <Text>Connection status</Text>
          <StatusPill
            states={states}
            activeStatus={isConnected ? "Connected" : "Disconnected"}
          />
        </View>

        <View style={styles.row}>
          <Text>Address</Text>
          <Text color={theme.colors.text.secondary}>{address}</Text>
        </View>
      </SettingWrapper>
      <Button title="Edit" onPress={onEdit} />
    </>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
});

export default ConnectionStatus;
