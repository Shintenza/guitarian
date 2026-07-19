import { Spinner, Text } from "@/ui/components";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type DragAreaProps = {
  isDeleting?: boolean;
  active?: boolean;
  height: number;
};

const DragArea = ({ active, height, isDeleting }: DragAreaProps) => {
  const { theme } = useUnistyles();
  const color = active ? theme.colors.red : theme.colors.text.secondary;

  return (
    <View style={styles.dropArea({ active, height })}>
      <View style={styles.content}>
        {isDeleting ? (
          <Spinner size="large" />
        ) : (
          <>
            <MaterialDesignIcons
              name="trash-can-outline"
              size={32}
              color={color}
            />
            <Text size="XS" color={color} variant="semiBold">
              Drop here to unload the plugin
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  dropArea: ({ active, height }: Pick<DragAreaProps, "active" | "height">) => ({
    height,
    borderColor: active ? theme.colors.red : theme.colors.background.tertiary,
    borderWidth: 2,
    borderStyle: "dashed",
    width: "100%",
    position: "absolute",
    bottom: 0,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  }),
  content: {
    justifyContent: "center",
    alignItems: "center",
  },
}));

export default DragArea;
