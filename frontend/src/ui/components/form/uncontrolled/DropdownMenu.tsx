import { Option } from "@/types/plugins";
import { useLatestRef } from "@/utils/ref";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Text } from "../../text";

export type DropdownMenuProps<T> = {
  multiple?: boolean;
  label?: string;
  description?: string;
  data: Option<T>[];
  value: T;
  zIndex?: number;
  error?: string;
  onChange: (value: T) => void;
};

const DropdownMenu = <T,>({
  zIndex,
  multiple = false,
  label,
  description,
  data,
  value,
  error,
  onChange,
}: DropdownMenuProps<T>) => {
  const { theme } = useUnistyles();
  const [innerValue, setInnerValue] = useState<T[] | T | null>(value ?? null);
  const onChangeRef = useLatestRef(onChange);
  const [open, setOpen] = useState(false);
  const syncedInitially = useRef(false);

  useEffect(() => {
    if (!syncedInitially.current && value) {
      setInnerValue(value);
      syncedInitially.current = true;
    }
  }, [value]);

  useEffect(() => {
    onChangeRef.current(innerValue as T);
  }, [innerValue, onChangeRef]);

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
      <DropDownPicker
        zIndex={zIndex}
        multiple={multiple}
        items={data as any}
        value={innerValue as any}
        setValue={setInnerValue}
        style={styles.input}
        open={open}
        setOpen={setOpen}
        arrowIconStyle={styles.iconStyle as any}
        tickIconStyle={styles.iconStyle as any}
        dropDownContainerStyle={styles.dropdownContainer}
        listItemLabelStyle={styles.listItemLabel}
        listItemContainerStyle={styles.listItemContainerStyle}
        disableBorderRadius
        listMode="SCROLLVIEW"
        containerProps={{
          style: styles.inputContainer,
        }}
        flatListProps={{
          contentContainerStyle: styles.flatListContainerStyle,
        }}
        labelProps={{
          style: styles.label,
        }}
      />
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
    gap: 6,
  },
  mainStyle: {
    borderWidth: 0,
    backgroundColor: "transparent",
    borderRadius: 8,
  },
  input: {
    padding: 12,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  inputContainer: {
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: theme.colors.orange,
    backgroundColor: "transparent",
  },
  iconStyle: {
    tintColor: theme.colors.text.primary,
  },
  flatListContainerStyle: {
    gap: 4,
    padding: 4,
    borderRadius: 8,
  },
  dropdownContainer: {
    backgroundColor: theme.colors.background.tertiary,
    color: theme.colors.text.primary,
    borderWidth: 0,
    marginTop: 5,
    borderTopWidth: 1,
    gap: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  listParentContainerStyle: {
    borderRadius: 8,
  },
  listItemContainerStyle: {
    padding: 2,
  },
  listItemLabel: {
    color: theme.colors.text.primary,
  },
  label: {
    flex: 1,
    color: theme.colors.text.primary,
  },
}));

export default DropdownMenu;
