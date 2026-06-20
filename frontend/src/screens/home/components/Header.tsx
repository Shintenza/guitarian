import { useChainStore } from "@/stores/chain";
import { IconButton, Text } from "@/ui/components";
import SaveIcon from "@expo/material-symbols/save.xml";
import { Icon } from "@expo/ui";
import { MenuView, NativeActionEvent } from "@expo/ui/community/menu";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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
  onEdit: () => void;
};

const Header = ({ onEdit }: HeaderProps) => {
  const { presetName, isDirty } = useChainStore();
  const chevronProgress = useSharedValue(0);

  const onTitlePress = () => {
    let destination = 180;
    if (chevronProgress.value > 0) {
      destination = 0;
    }
    chevronProgress.value = withTiming(destination);
  };

  const animatedChevronSyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronProgress.value}deg` }],
  }));

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
        <Text variant="semiBold">{presetName}</Text>
        <AnimatedIcon
          name={"chevron-down"}
          color={theme.colors.text.primary}
          size={18}
          style={[animatedChevronSyle, styles.chevronStyle]}
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
