import { EffectClass } from "@/types/plugins";
import Text from "@/ui/components/text/Text";
import { getEffectUIConfig } from "@/ui/effects/definitions";
import { withHaptics } from "@/utils/haptics";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Spinner from "../Spinner";

type LibraryPluginCardProps = {
  name: string;
  effectClass: EffectClass;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
};

const LibraryPluginCard = ({
  loading,
  disabled,
  name,
  effectClass,
  onPress,
}: LibraryPluginCardProps) => {
  const { iconName, color } = getEffectUIConfig(effectClass);

  const shouldShowOverlay = loading || disabled;

  return (
    <Pressable onPress={withHaptics(onPress)} disabled={shouldShowOverlay}>
      <View style={styles.container}>
        {shouldShowOverlay && (
          <View style={styles.disabledOverlay({ loading })}>
            {loading && <Spinner size="large" />}
          </View>
        )}
        <View style={styles.iconContainer(color)}>
          <MaterialDesignIcons name={iconName} color={color} size={48} />
        </View>
        <View style={styles.textContainer}>
          <Text size="S" numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.pill(color)}>
            <Text size="XS" variant="bold">
              {effectClass.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};
const BORDER_RADIUS = 8;

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background.tertiary,
    padding: 16,
    borderRadius: BORDER_RADIUS,
    alignItems: "center",
    gap: 12,
  },
  iconContainer: (color: string) => ({
    borderRadius: 8,
    borderWidth: 3,
    borderColor: color,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  }),
  pill: (color: string) => ({
    height: 24,
    backgroundColor: color,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
  }),
  textContainer: {
    gap: 8,
    alignItems: "center",
  },
  disabledOverlay: ({ loading }: Pick<LibraryPluginCardProps, "loading">) => ({
    position: "absolute",
    inset: 0,
    zIndex: 2,
    opacity: loading ? 0.8 : 0.7,
    backgroundColor: theme.colors.background.main,
    borderRadius: BORDER_RADIUS,
    justifyContent: "center",
    alignItems: "center",
  }),
}));

export default LibraryPluginCard;
