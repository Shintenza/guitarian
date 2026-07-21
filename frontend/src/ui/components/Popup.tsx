import { ReactNode, Ref, useImperativeHandle, useState } from "react";
import { Keyboard, Modal, Pressable, View, ViewStyle } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import ConditionalWrapper from "./ConditionalWrapper";
import IconButton from "./IconButton";

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
  withOverlay?: boolean;
  withCloseButton?: boolean;
  onDismiss?: () => void;
};

const ConfirmationPopup = ({
  ref,
  children,
  style,
  closeOnBackdropPress = false,
  avoidKeyboard = true,
  withOverlay = false,
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
        {withOverlay && <View style={styles.overlay} />}
        <ConditionalWrapper
          enabled={avoidKeyboard}
          wrapper={KeyboardAvoidingView}
          wrapperProps={{ behavior: "padding", keyboardVerticalOffset: 24 }}
        >
          <Pressable
            style={[styles.container, style]}
            onPress={Keyboard.dismiss}
          >
            <View style={styles.closeButtonContainer}>
              <IconButton
                iconName="close"
                backgroundColor="transparent"
                onPress={() => {
                  setIsOpened(false);
                }}
              />
            </View>
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
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "black",
    opacity: 0.6,
  },
  closeButtonContainer: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 2,
  },
  container: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.background.secondary,
  },
}));

export default ConfirmationPopup;
