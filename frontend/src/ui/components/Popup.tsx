import { ReactNode, Ref, useImperativeHandle, useState } from "react";
import { Modal, Pressable, View, ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type PopupRef = {
  open: () => void;
  close: () => void;
};

export type PopupProps = {
  ref?: Ref<PopupRef>;
  children: ReactNode;
  style?: ViewStyle;
  closeOnBackdropPress?: boolean;
  onDismiss?: () => void;
};

const ConfirmationPopup = ({
  ref,
  children,
  style,
  closeOnBackdropPress = false,
  onDismiss,
}: PopupProps) => {
  const [isOpened, setIsOpened] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpened(true),
    close: () => setIsOpened(false),
  }));

  const handleDismiss = () => {
    onDismiss?.();
    setIsOpened(false);
  };

  return (
    <Modal
      visible={isOpened}
      transparent
      onRequestClose={handleDismiss}
      animationType="fade"
    >
      <Pressable
        style={styles.centered}
        onPress={closeOnBackdropPress ? handleDismiss : undefined}
      >
        <View style={[styles.container, style]}>{children}</View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create((theme) => ({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.background.secondary,
  },
}));

export default ConfirmationPopup;
