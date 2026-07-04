import { Option } from "@/types/plugins";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Button from "../../Button";

export type SelectablePillConfig<T> = Option<T> & {
  color: string;
};

export type SelectablePillsProps<T> = {
  data: SelectablePillConfig<T>[];
  values: T[];
  onChange: (values: T[]) => void;
};

const SelectablePills = <T,>({
  data,
  values = [],
  onChange,
}: SelectablePillsProps<T>) => {
  const handleToggle = (value: T) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <View style={styles.container}>
      {data.map((option) => {
        const isSelected = values.includes(option.value);

        return (
          <Button
            key={`${option.value}`}
            variant={isSelected ? "solid" : "outline"}
            title={`${option.label}`}
            color={option.color}
            onPress={() => handleToggle(option.value)}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});

export default SelectablePills;
