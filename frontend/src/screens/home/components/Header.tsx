import { usePresetStore } from "@/stores/preset";
import { IconButton, Text } from "@/ui/components";
import SaveIcon from "@expo/material-symbols/save.xml";
import { Icon } from "@expo/ui";
import { MenuView, NativeActionEvent } from "@expo/ui/community/menu";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { Pressable, View } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const editIcon = Icon.select({
  ios: "pencil",
  android: import("@expo/material-symbols/edit.xml"),
});

const saveIcon = Icon.select({
  ios: "square.and.arrow.down",
  android: SaveIcon,
});

type HeaderProps = {
  isPresetsModalActive?: boolean;
  onEdit: () => void;
  onPresetPress: () => void;
};

const Header = ({
  isPresetsModalActive,
  onEdit,
  onPresetPress,
}: HeaderProps) => {
  const { name, isDirty } = usePresetStore();
  const chevronProgress = useSharedValue(0);

  const onTitlePress = () => {
    let destination = 180;
    if (chevronProgress.value > 0) {
      destination = 0;
    }
    chevronProgress.value = withTiming(destination);
    onPresetPress();
  };

  const onActionPress = (e: NativeActionEvent) => {
    const action = e.nativeEvent.event;
    if (action === "edit") {
      onEdit();
    }
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
        <MenuView
          onPressAction={onActionPress}
          dropdownColor={theme.colors.background.tertiary}
          actions={[
            { id: "edit", title: "Edit", image: editIcon },
            {
              id: "delete",
              title: "Save",
              image: saveIcon,
              attributes: {
                disabled: !isDirty,
              },
            },
          ]}
        >
          <IconButton iconName="dots-vertical" backgroundColor="transparent" />
        </MenuView>
      </View>
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
    right: 6,
    bottom: 2,
  },
}));

const AnimatedIcon = Animated.createAnimatedComponent(MaterialDesignIcons);

export default Header;
