import {
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import Animated, {
  measure,
  SharedValue,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { scheduleOnUI } from "react-native-worklets";

export type FloatingDropdownRef = {
  open: () => void;
  close: () => void;
};

type FloatingDropdownProps = {
  ref?: Ref<FloatingDropdownRef>;
  trigger: (state: { open: boolean }) => ReactNode;
  children: ReactNode;
  maxHeight?: number;
  gap?: number;
  screenOffset?: SharedValue<number>;
  onClose?: () => void;
};

const FloatingDropdown = ({
  ref,
  trigger,
  children,
  maxHeight = 240,
  gap = 6,
  screenOffset,
  onClose,
}: FloatingDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { height: windowHeight } = useWindowDimensions();

  const triggerX = useSharedValue(0);
  const triggerY = useSharedValue(0);
  const triggerWidth = useSharedValue(0);
  const triggerHeight = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const measured = useSharedValue(false);
  const screenHeight = useSharedValue(windowHeight);

  useEffect(() => {
    screenHeight.value = windowHeight;
  }, [windowHeight, screenHeight]);

  const triggerRef = useAnimatedRef<Animated.View>();
  const contentRef = useAnimatedRef<Animated.View>();

  const measureTrigger = useCallback(() => {
    "worklet";
    const measurements = measure(triggerRef);
    if (measurements) {
      triggerX.value = measurements.pageX;
      triggerY.value = measurements.pageY;
      triggerWidth.value = measurements.width;
      triggerHeight.value = measurements.height;
    }
  }, [triggerRef, triggerX, triggerY, triggerWidth, triggerHeight]);

  const measureContent = useCallback(() => {
    "worklet";
    const measurements = measure(contentRef);
    if (measurements) {
      contentHeight.value = measurements.height;
      measured.value = true;
    }
  }, [contentRef, contentHeight, measured]);

  const open = useCallback(() => {
    measured.value = false;
    scheduleOnUI(measureTrigger);
    setIsOpen(true);
  }, [measureTrigger, measured]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  useImperativeHandle(ref, () => ({ open, close }), [open, close]);

  const contentStyle = useAnimatedStyle(() => {
    const anchoredY = triggerY.value + (screenOffset ? screenOffset.value : 0);
    const opensBelow =
      anchoredY + triggerHeight.value + gap + contentHeight.value <
      screenHeight.value;

    return {
      opacity: measured.value ? 1 : 0,
      left: triggerX.value,
      top: opensBelow
        ? anchoredY + triggerHeight.value + gap
        : anchoredY - gap - contentHeight.value,
      width: triggerWidth.value,
    };
  });

  return (
    <>
      <Animated.View ref={triggerRef}>
        {trigger({ open: isOpen })}
      </Animated.View>
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close}>
          <Animated.View
            ref={contentRef}
            onLayout={() => scheduleOnUI(measureContent)}
            style={[styles.content, { maxHeight }, contentStyle]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(event) => event.stopPropagation()}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {children}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
  },
  content: {
    position: "absolute",
    borderRadius: 12,
    backgroundColor: theme.colors.background.tertiary,
    overflow: "hidden",
  },
  scrollContent: {
    gap: 4,
    padding: 4,
  },
}));

export default FloatingDropdown;
