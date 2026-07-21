import { Popup, Text } from "@/ui/components";
import { PopupRef } from "@/ui/components/Popup";
import { Ref } from "react";
import { StyleSheet } from "react-native-unistyles";

type LatencyDetailsPopupProps = {
  ref: Ref<PopupRef>;
};

const LatencyDetailsPopup = ({ ref }: LatencyDetailsPopupProps) => {
  return (
    <Popup ref={ref} closeOnBackdropPress withOverlay style={styles.container}>
      <Text size="H3">Buffer size</Text>
      <Text>
        Buffer size determines how many audio samples are processed at once.
        Smaller buffer sizes reduce latency but require more frequent
        processing, increasing resource usage and the risk of XRUNs on less
        powerful devices. Larger buffer sizes increase latency but generally
        provide more stable audio processing and lower resource usage.
      </Text>
    </Popup>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});

export default LatencyDetailsPopup;
