import { useConnection } from "@/contexts/ConnectionProvider";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ConnectionBanner from "./ConnectionBanner";

const ChainOverlay = () => {
  const { isConnected, isConnecting, isError } = useConnection();

  const shouldShowBanner = isConnecting || isError;
  const shouldShow = !isConnected;
  return (
    <>
      {shouldShow && <View style={styles.overlay} />}
      {shouldShowBanner && <ConnectionBanner />}
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: theme.colors.background.secondary,
    opacity: 0.5,
    pointerEvents: "auto",
  },
}));

export default ChainOverlay;
