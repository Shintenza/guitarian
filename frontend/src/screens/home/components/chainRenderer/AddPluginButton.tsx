import { IconButton } from "@/ui/components";
import Animated from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type AddPluginButtonProps = {
  offsetY?: number;
  onPress: () => void;
};

const AddPluginButton = ({ offsetY, onPress }: AddPluginButtonProps) => {
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: offsetY ? -offsetY : 0 }],
          transitionDuration: 200,
          transitionProperty: "transform",
        },
      ]}
    >
      <IconButton iconName="plus" size="huge" onPress={onPress} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    bottom: 16,
    alignItems: "center",
  },
});

export default AddPluginButton;
