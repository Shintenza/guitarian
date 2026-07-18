import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Text, TextProps } from "./text";

type StatusPillProps<T extends Record<string, string>> = TextProps & {
  states: T;
  activeStatus: keyof T;
};

const StatusPill = <T extends Record<string, string>>({
  states,
  activeStatus,
  children,
  ...textProps
}: StatusPillProps<T>) => {
  const color = states[activeStatus];

  return (
    <View style={styles.container({ color })}>
      <View style={styles.dot({ color })} />
      <Text
        color={color}
        size="S"
        variant="semiBold"
        {...textProps}
        style={[styles.text, textProps.style]}
      >
        {activeStatus as string}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: ({ color }: { color?: string }) => ({
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderRadius: 18,
    borderColor: color,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  }),
  dot: ({ color }: { color?: string }) => ({
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: color,
  }),
  text: {
    alignSelf: "flex-start",
  },
}));

export default StatusPill;
