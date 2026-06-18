import Text from "@/ui/components/text/Text";
import { getEffectUIConfig } from "@/ui/effects/definitions";
import { EffectClass } from "@/ui/effects/types";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type ChainCardProps = {
  name: string;
  effectClass: EffectClass;
};

const ChainCard = ({ name, effectClass }: ChainCardProps) => {
  const { iconName, color } = getEffectUIConfig(effectClass);

  return (
    <View style={styles.container}>
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
  container: {
    backgroundColor: theme.colors.background.secondary,
    padding: 16,
    borderRadius: 8,
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
  textContainer: {
    gap: 8,
    alignItems: "center",
  },
}));

export default ChainCard;
