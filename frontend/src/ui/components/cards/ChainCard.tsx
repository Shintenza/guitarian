import { EffectClass } from "@/types/plugins";
import Text from "@/ui/components/text/Text";
import { getEffectUIConfig } from "@/ui/effects/definitions";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import IconButton from "../IconButton";
import { CARD_SIZES } from "./size";
import { CardTypes } from "./types";

type ChainCardProps = {
  name: string;
  effectClass: EffectClass;
  disabled?: boolean;
  pendingDeletion?: boolean;
  onDelete?: () => void;
  onPress?: () => void;
};

const ChainCard = ({
  name,
  effectClass,
  pendingDeletion,
  disabled,
  onDelete,
  onPress,
}: ChainCardProps) => {
  const { theme } = useUnistyles();
  const { iconName, color } = getEffectUIConfig(effectClass);

  const shouldShowOverlay = disabled && !pendingDeletion;

  return (
    <Pressable disabled={disabled} onPress={onPress}>
      <View style={styles.container({ pendingDeletion })}>
        {onDelete && (
          <IconButton
            iconName="close"
            backgroundColor={theme.colors.red}
            size="tiny"
            style={styles.buttonStyle}
            onPress={onDelete}
          />
        )}
        {shouldShowOverlay && <View style={styles.overlay} />}
        <View style={styles.iconContainer(color)}>
          <MaterialDesignIcons name={iconName} color={color} size={48} />
        </View>
        <View style={styles.textContainer}>
          <Text size="XXS" numberOfLines={1}>
            {name}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const BORDER_RADIUS = 8;

const styles = StyleSheet.create((theme) => ({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: theme.colors.background.main,
    opacity: 0.6,
    zIndex: 2,
    borderRadius: BORDER_RADIUS,
  },
  buttonStyle: {
    position: "absolute",
    right: -7,
    top: -7,
  },
  container: ({
    pendingDeletion,
  }: Pick<ChainCardProps, "pendingDeletion">) => ({
    backgroundColor: theme.colors.background.secondary,
    padding: 16,
    borderRadius: BORDER_RADIUS,
    alignItems: "center",
    gap: 12,
    width: CARD_SIZES[CardTypes.chainCard].width,
    height: CARD_SIZES[CardTypes.chainCard].height,
    opacity: pendingDeletion ? 0.4 : 1,
  }),
  iconContainer: (color: string) => ({
    borderRadius: 8,
    borderWidth: 3,
    borderColor: color,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  }),
  textContainer: {
    gap: 8,
    alignItems: "center",
  },
}));

export default ChainCard;
