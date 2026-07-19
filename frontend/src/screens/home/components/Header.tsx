import { useClearChain } from "@/api/chain";
import { useConfirm } from "@/contexts/ConfirmationProvider";
import { usePresetStore } from "@/stores/preset";
import { Menu, Text } from "@/ui/components";
import { PopupRef } from "@/ui/components/Popup";
import SaveIcon from "@expo/material-symbols/save.xml";
import { Icon } from "@expo/ui";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { useRef } from "react";
import { Pressable, View } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { toast } from "sonner-native";
import SavePresetPopup from "./SavePresetPopup";

const saveIcon = Icon.select({
  ios: "square.and.arrow.down",
  android: SaveIcon,
});

const deleteIcon = Icon.select({
  ios: "trash",
  android: import("@expo/material-symbols/delete.xml"),
});

type HeaderProps = {
  isPresetsModalActive?: boolean;
  onPresetPress: () => void;
};

const Header = ({ isPresetsModalActive, onPresetPress }: HeaderProps) => {
  const { name, isDirty } = usePresetStore();
  const chevronProgress = useSharedValue(0);
  const { confirm } = useConfirm();
  const { mutateAsync: clearChain } = useClearChain();
  const ref = useRef<PopupRef>(null);

  const onTitlePress = () => {
    let destination = 180;
    if (chevronProgress.value > 0) {
      destination = 0;
    }
    chevronProgress.value = withTiming(destination);
    onPresetPress();
  };

  const handleClearChain = async () => {
    await confirm({
      onConfirm: async () => {
        try {
          await clearChain();
        } catch {
          toast.error("Failed to clear the chain");
        }
      },
    });
  };

  const { theme } = useUnistyles();
  return (
    <View style={styles.container}>
      <Pressable style={styles.titleContainer} onPress={onTitlePress}>
        <Text variant="semiBold">{name}</Text>
        <AnimatedIcon
          name={"chevron-down"}
          color={theme.colors.text.primary}
          size={18}
          style={[
            {
              transform: [{ rotate: `${isPresetsModalActive ? 180 : 0}deg` }],
              transitionDuration: 200,
              transitionProperty: ["transform"],
            } as any,
            styles.chevronStyle,
          ]}
        />
      </Pressable>
      <View style={styles.controlsBox}>
        <Menu
          actions={[
            {
              id: "save",
              title: "Save",
              image: saveIcon,
              onPress: () => {
                ref.current?.open();
              },
              attributes: {
                disabled: !isDirty,
              },
            },
            {
              id: "clear",
              title: "Clear chain",
              image: deleteIcon,
              onPress: () => {
                handleClearChain();
              },
              attributes: {
                destructive: true,
              },
            },
          ]}
        />
      </View>
      <SavePresetPopup ref={ref} />
    </View>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    paddingTop: rt.insets.top + 8,
    paddingBottom: 8,
    backgroundColor: theme.colors.background.secondary,
    flexDirection: "row",
    justifyContent: "center",
  },
  chevronStyle: {
    marginTop: 3,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "center",
  },
  controlsBox: {
    position: "absolute",
    right: 8,
    bottom: 10,
  },
}));

const AnimatedIcon = Animated.createAnimatedComponent(MaterialDesignIcons);

export default Header;
