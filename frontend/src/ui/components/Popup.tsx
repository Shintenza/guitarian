import { ReactNode, Ref, useImperativeHandle, useState } from "react";
import { Keyboard, Modal, Pressable, ViewStyle } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import ConditionalWrapper from "./ConditionalWrapper";

export type PopupRef = {
  open: () => void;
  close: () => void;
};

export type PopupProps = {
  ref?: Ref<PopupRef>;
  children: ReactNode;
  style?: ViewStyle;
  closeOnBackdropPress?: boolean;
  avoidKeyboard?: boolean;
  onDismiss?: () => void;
};

const ConfirmationPopup = ({
  ref,
  children,
  style,
  closeOnBackdropPress = false,
  avoidKeyboard = true,
  onDismiss,
}: PopupProps) => {
  const [isOpened, setIsOpened] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpened(true),
    close: () => setIsOpened(false),
  }));

  const handleDismiss = () => {
    Keyboard.dismiss();
    if (closeOnBackdropPress) {
      onDismiss?.();
      setIsOpened(false);
    }
  };

  return (
    <Modal
      visible={isOpened}
      transparent
      onRequestClose={handleDismiss}
      animationType="fade"
    >
      <Pressable style={styles.centered} onPress={handleDismiss}>
        <ConditionalWrapper
          enabled={avoidKeyboard}
          wrapper={KeyboardAvoidingView}
          wrapperProps={{ behavior: "padding", keyboardVerticalOffset: 24 }}
        >
          <Pressable
            style={[styles.container, style]}
            onPress={Keyboard.dismiss}
          >
            {children}
          </Pressable>
        </ConditionalWrapper>
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
