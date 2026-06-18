import Text from "@/ui/components/text/Text";
import { getEffectUIConfig } from "@/ui/effects/definitions";
import { EffectClass } from "@/ui/effects/types";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type LibraryPluginCardProps = {
  name: string;
  effectClass: EffectClass;
  onPress: () => void;
};

const LibraryPluginCard = ({
  name,
  effectClass,
  onPress,
}: LibraryPluginCardProps) => {
  const { iconName, color } = getEffectUIConfig(effectClass);

  return (
    <Pressable onPress={onPress}>
      <View style={styles.container}>
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

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background.tertiary,
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
}));

export default LibraryPluginCard;
