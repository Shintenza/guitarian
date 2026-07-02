import { mergeRefs } from "@/utils/ref";
import { useRef } from "react";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import Button from "./Button";
import Popup, { PopupProps, PopupRef } from "./Popup";
import Text from "./text/Text";

export type ConfirmationPopupProps = {
  title?: string;
  confirmationTitle?: string;
  rejectionTitle?: string;
  confirmButtonLoading?: boolean;
  onConfirm: () => void;
  onReject?: () => void;
} & Omit<PopupProps, "children">;

const ConfirmationPopup = ({
  ref,
  title = "Are you sure?",
  confirmationTitle = "Yes",
  rejectionTitle = "No",
  confirmButtonLoading,
  onConfirm,
  onReject,
}: ConfirmationPopupProps) => {
  const { theme } = useUnistyles();
  const popupRef = useRef<PopupRef>(null);

  const onRejectPress = () => {
    popupRef.current?.close();
    onReject?.();
  };

  const onConfirmPress = () => {
    popupRef.current?.close();
    onConfirm?.();
  };

  return (
    <Popup
      ref={mergeRefs(ref, popupRef)}
      style={styles.popupStyle}
      onDismiss={() => onReject?.()}
    >
      <Text>{title}</Text>
      <View style={styles.buttonsContainer}>
        <Button
          color={theme.colors.background.tertiary}
          title={rejectionTitle}
          onPress={onRejectPress}
          style={styles.button}
        />
        <Button
          title={confirmationTitle}
          onPress={onConfirmPress}
          style={styles.button}
          loading={confirmButtonLoading}
        />
      </View>
    </Popup>
  );
};

const styles = StyleSheet.create({
  popupStyle: {
    gap: 8,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    width: 120,
  },
});

export default ConfirmationPopup;
