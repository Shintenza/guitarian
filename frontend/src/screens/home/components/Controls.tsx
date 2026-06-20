import { Button, IconButton } from "@/ui/components";
import { View } from "react-native";
import Animated, { SlideInRight } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type ControlsProps = {
  isEditMode: boolean;
  onCancelEdit: () => void;
  onAddPress: () => void;
};

const Controls = ({ isEditMode, onAddPress, onCancelEdit }: ControlsProps) => {
  const { theme } = useUnistyles();
  return (
    <View style={styles.container}>
      {isEditMode && (
        <AnimatedButton
          entering={SlideInRight}
          title="Remove all"
          variant="outline"
          onPress={() => {}}
        />
      )}
      <AnimatedIconButton
        iconName="plus"
        size="huge"
        onPress={isEditMode ? onCancelEdit : onAddPress}
        style={[
          {
            transform: [{ rotate: `${isEditMode ? 45 : 0}deg` }],
            backgroundColor: isEditMode
              ? theme.colors.background.secondary
              : theme.colors.orange,
            transitionDuration: 200,
            transitionProperty: ["backgroundColor", "transform"],
          },
        ]}
      />
    </View>
  );
};

const AnimatedIconButton = Animated.createAnimatedComponent(IconButton);
const AnimatedButton = Animated.createAnimatedComponent(Button);

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "absolute",
    right: 16,
    bottom: 16,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
}));

export default Controls;
