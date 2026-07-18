import { useConnection } from "@/contexts/ConnectionProvider";
import { Spinner } from "@/ui/components";
import { Redirect, useRouter } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ConnectionError from "./components/ConnectionError";

const EntryScreen = () => {
  const { isScanningError, isPending, isConnectionError, retry, isConnected } =
    useConnection();
  const { push } = useRouter();

  if (isConnected) {
    return <Redirect href="/home" />;
  }

  return (
    <View style={styles.container}>
      {isPending && <Spinner size="large" />}

      {isConnectionError && (
        <ConnectionError
          title="Failed to connect to the engine"
          description="Check if the device is configured properly"
          onRetry={retry}
          alternativeAction={{
            title: "Manage connection address",
            onPress: () => push("/settings/connection"),
          }}
        />
      )}

      {isScanningError && (
        <ConnectionError
          title="Failed to find the engine"
          description="Make sure the engine device is in the same network"
          onRetry={retry}
          alternativeAction={{
            title: "Enter address manually",
            onPress: () => push("/settings/connection"),
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});

export default EntryScreen;
