import { EffectClass } from "@/types/plugins";
import Text from "@/ui/components/text/Text";
import { getEffectUIConfig } from "@/ui/effects/definitions";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { CARD_SIZES } from "./size";
import { CardTypes } from "./types";

type ChainCardProps = {
  name: string;
  effectClass: EffectClass;
  disabled?: boolean;
  pendingDeletion?: boolean;
};

const ChainCard = ({
  name,
  effectClass,
  pendingDeletion,
  disabled,
}: ChainCardProps) => {
  const { iconName, color } = getEffectUIConfig(effectClass);

  return (
    <View style={styles.container({ pendingDeletion })}>
      {disabled && <View style={styles.overlay} />}
      <View style={styles.iconContainer(color)}>
        <MaterialDesignIcons name={iconName} color={color} size={48} />
      </View>
      <View style={styles.textContainer}>
        <Text size="XXS" numberOfLines={1}>
          {name}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: theme.colors.background.main,
    opacity: 0.6,
    zIndex: 2,
  },
  container: ({
    pendingDeletion,
  }: Pick<ChainCardProps, "pendingDeletion">) => ({
    overflow: "hidden",
    backgroundColor: theme.colors.background.secondary,
    padding: 16,
    borderRadius: 8,
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
