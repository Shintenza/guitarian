import { useConnection } from "@/contexts/ConnectionProvider";
import { Text, TextButton } from "@/ui/components";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { CONNECTION_BANNER_HEIGHT } from "./consts";

const ConnectionBanner = () => {
  const { isConnecting, isError, retry } = useConnection();
  const { push } = useRouter();
  return (
    <View style={styles.banner({ critical: isError })}>
      {isConnecting && <Text>Connecting with the engine...</Text>}
      {isError && (
        <View style={styles.row}>
          <Text>Connection error! </Text>
          <TextButton title="Retry" onPress={retry} />
          <Text> or </Text>
          <TextButton
            title="edit connection"
            onPress={() => push("/settings/connection")}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  banner: ({ critical }: { critical: boolean }) => ({
    height: CONNECTION_BANNER_HEIGHT,
    backgroundColor: critical ? theme.colors.red : theme.colors.cadmiumYellow,
    width: "100%",
    alignItems: "center",
  }),
  row: {
    flexDirection: "row",
  },
}));

export default ConnectionBanner;
