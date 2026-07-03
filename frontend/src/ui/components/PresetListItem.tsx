import Text from "@/ui/components/text/Text";
import { withHaptics } from "@/utils/haptics";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import IconButton from "./IconButton";
import Spinner from "./Spinner";

type PresetListItemProps = {
  active?: boolean;
  loading?: boolean;
  name: string;
  onPress: () => void;
  onDelete: () => void;
};

const PresetListItem = ({
  name,
  active,
  onPress,
  onDelete,
}: PresetListItemProps) => {
  const loading = false;
  const { theme } = useUnistyles();

  return (
    <Pressable
      onPress={withHaptics(onPress)}
      style={styles.container({ active })}
    >
      <Text>{name}</Text>
      {loading ? (
        <View style={styles.spinnerBackground}>
          <Spinner color={theme.colors.text.primary} />
        </View>
      ) : (
        <IconButton iconName="delete" onPress={onDelete} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: ({ active }: { active?: boolean }) => ({
    backgroundColor: theme.colors.background.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "space-between",
    flexDirection: "row",
    borderRadius: 8,
    alignItems: "center",
    ...(active
      ? {
          borderWidth: 2,
          borderColor: theme.colors.orange,
        }
      : {}),
  }),
  spinnerBackground: {
    padding: 6,
    borderRadius: 24,
    backgroundColor: theme.colors.orange,
  },
}));

export default PresetListItem;
