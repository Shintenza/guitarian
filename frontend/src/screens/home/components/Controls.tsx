import { useClearChain } from "@/api/chain";
import { useConfirm } from "@/contexts/ConfirmationProvider";
import { useConnection } from "@/contexts/ConnectionProvider";
import { Button, IconButton } from "@/ui/components";
import { View } from "react-native";
import Animated, { SlideInRight } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { toast } from "sonner-native";

type ControlsProps = {
  isEditMode: boolean;
  onCancelEdit: () => void;
  onAddPress: () => void;
};

const Controls = ({ isEditMode, onAddPress, onCancelEdit }: ControlsProps) => {
  const { mutateAsync: clearChain } = useClearChain();
  const { isConnected } = useConnection();
  const { confirm } = useConfirm();
  const { theme } = useUnistyles();

  const onRemoveAll = async () => {
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

  return (
    <View style={styles.container}>
      <View style={styles.buttons({ useExtraBottomPadding: !isConnected })}>
        {isEditMode && (
          <AnimatedButton
            entering={SlideInRight}
            title="Remove all"
            variant="outline"
            onPress={onRemoveAll}
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
    </View>
  );
};

const AnimatedIconButton = Animated.createAnimatedComponent(IconButton);
const AnimatedButton = Animated.createAnimatedComponent(Button);

const EXTRA_BOTTOM_PADDING = 30;

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  buttons: ({
    useExtraBottomPadding,
  }: {
    useExtraBottomPadding?: boolean;
  }) => ({
    alignSelf: "flex-end",
    paddingBottom: 16 + (useExtraBottomPadding ? EXTRA_BOTTOM_PADDING : 0),
    paddingRight: 16,
  }),
}));

export default Controls;
