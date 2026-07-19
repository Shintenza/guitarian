// eslint-disable-next-line import/no-named-as-default
import MenuView, {
  MenuAction,
  NativeActionEvent,
} from "@expo/ui/community/menu";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type MenuActionItem = MenuAction & {
  onPress: () => void;
};

type MenuProps = {
  actions: MenuActionItem[];
};

const Menu = ({ actions }: MenuProps) => {
  const { theme } = useUnistyles();

  // TODO add support for nested options
  const onActionPress = (e: NativeActionEvent) => {
    const actionName = e.nativeEvent.event;
    const callback = actions.find(
      (action) => action.id === actionName,
    )?.onPress;
    callback?.();
  };
  return (
    <MenuView
      onPressAction={onActionPress}
      dropdownColor={theme.colors.background.tertiary}
      actions={actions}
    >
      <View style={styles.container}>
        <MaterialDesignIcons name="dots-vertical" color={"white"} size={20} />
      </View>
    </MenuView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Menu;
