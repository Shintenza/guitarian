import { Text } from "@/ui/components";
import Spinner from "@/ui/components/Spinner";
import { withHaptics } from "@/utils/haptics";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type PresetListItemProps = {
  active?: boolean;
  loading?: boolean;
  name: string;
  onPress: () => void;
};

const PresetListItem = ({
  name,
  active,
  loading,
  onPress,
}: PresetListItemProps) => {
  const isContainerActive = active || loading;

  return (
    <Pressable
      onPress={withHaptics(onPress)}
      style={styles.container({ active: isContainerActive })}
    >
      <Text>{name}</Text>
      {active && (
        <View style={styles.pill}>
          <Text variant="semiBold">Active</Text>
        </View>
      )}
      {loading && <Spinner />}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: ({ active }: { active?: boolean }) => ({
    ...(active
      ? {
          backgroundColor: theme.colors.background.tertiary,
          paddingHorizontal: 12,
          paddingVertical: 8,
          justifyContent: "space-between",
          flexDirection: "row",
        }
      : {}),
    borderRadius: 8,
  }),
  pill: {
    backgroundColor: theme.colors.green,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
}));

export default PresetListItem;
