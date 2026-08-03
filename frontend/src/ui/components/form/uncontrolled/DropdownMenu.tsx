import { Option } from "@/types/plugins";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { useRef } from "react";
import { Pressable, View } from "react-native";
import { SharedValue } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import FloatingDropdown, { FloatingDropdownRef } from "../../FloatingDropdown";
import { Text } from "../../text";

export type DropdownMenuProps<T> = {
  multiple?: boolean;
  label?: string;
  description?: string;
  data: Option<T>[];
  value: T;
  error?: string;
  screenOffset?: SharedValue<number>;
  onChange: (value: T) => void;
};

const DropdownMenu = <T,>({
  multiple = false,
  label,
  description,
  data,
  value,
  error,
  screenOffset,
  onChange,
}: DropdownMenuProps<T>) => {
  const { theme } = useUnistyles();
  const dropdownRef = useRef<FloatingDropdownRef>(null);

  const selectedValues = multiple ? ((value as unknown as string[]) ?? []) : [];
  const selectedOptions = multiple
    ? data.filter((option) =>
        selectedValues.includes(option.value as unknown as string),
      )
    : [];
  const selectedOption = multiple
    ? undefined
    : data.find((option) => option.value === value);

  const handleSelect = (option: Option<T>) => {
    if (multiple) {
      const optionValue = option.value as unknown as string;
      const nextValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((current) => current !== optionValue)
        : [...selectedValues, optionValue];
      onChange(nextValues as unknown as T);
    } else {
      onChange(option.value);
      dropdownRef.current?.close();
    }
  };

  return (
    <View style={styles.container}>
      <View>
        {label && <Text>{label}</Text>}
        {description && (
          <Text size="XS" color={theme.colors.text.secondary}>
            {description}
          </Text>
        )}
      </View>
      <FloatingDropdown
        ref={dropdownRef}
        screenOffset={screenOffset}
        trigger={({ open }) => (
          <Pressable
            style={styles.trigger}
            onPress={() =>
              open ? dropdownRef.current?.close() : dropdownRef.current?.open()
            }
          >
            {multiple ? (
              selectedOptions.length > 0 ? (
                <View style={styles.pills}>
                  {selectedOptions.map((option) => (
                    <View key={String(option.value)} style={styles.pill}>
                      <Text size="XS" style={styles.pillText}>
                        {option.label}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.placeholder}>Select</Text>
              )
            ) : (
              <Text
                style={selectedOption ? styles.triggerText : styles.placeholder}
              >
                {selectedOption?.label ?? "Select"}
              </Text>
            )}
            <MaterialDesignIcons
              name="chevron-down"
              size={20}
              color={theme.colors.text.primary}
              style={open ? styles.iconRotated : undefined}
            />
          </Pressable>
        )}
      >
        {data.length === 0 ? (
          <Text
            size="XS"
            color={theme.colors.text.secondary}
            style={styles.emptyText}
          >
            No options available
          </Text>
        ) : (
          data.map((option) => {
            const isSelected = multiple
              ? selectedValues.includes(option.value as unknown as string)
              : option.value === value;

            return (
              <Pressable
                key={String(option.value)}
                onPress={() => handleSelect(option)}
                style={({ pressed }) => [
                  styles.item,
                  (isSelected || pressed) && styles.itemActive,
                ]}
              >
                <Text
                  style={isSelected ? styles.itemTextSelected : styles.itemText}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })
        )}
      </FloatingDropdown>
      {error && (
        <Text size="XS" color={theme.colors.red}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
    gap: 6,
  },
  trigger: {
    width: "100%",
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.orange,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  triggerText: {
    color: theme.colors.text.primary,
  },
  placeholder: {
    color: theme.colors.text.secondary,
  },
  pills: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: theme.colors.background.secondary,
  },
  pillText: {
    color: theme.colors.text.primary,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  itemActive: {
    backgroundColor: theme.colors.background.secondary,
  },
  itemText: {
    color: theme.colors.text.primary,
  },
  itemTextSelected: {
    color: theme.colors.orange,
  },
  emptyText: {
    padding: 16,
    textAlign: "center",
  },
  iconRotated: {
    transform: [{ rotate: "180deg" }],
  },
}));

export default DropdownMenu;
