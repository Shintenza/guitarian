import { Option } from "@/types/plugins";
import { useLatestRef } from "@/utils/ref";
import { useEffect, useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { StyleSheet } from "react-native-unistyles";

type DropdownMenuProps<T> = {
  multiple?: boolean;
  data: Option<T>[];
  value: T;
  zIndex: number;
  onChange: (value: T) => void;
};

const DropdownMenu = <T,>({
  zIndex,
  multiple = false,
  data,
  value,
  onChange,
}: DropdownMenuProps<T>) => {
  const [innerValue, setInnerValue] = useState<T | null>(value);
  const onChangeRef = useLatestRef(onChange);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    onChangeRef.current(innerValue!);
  }, [innerValue, onChangeRef]);

  return (
    <DropDownPicker
      zIndex={zIndex}
      multiple={multiple}
      items={data as any}
      value={innerValue as any}
      setValue={setInnerValue}
      style={styles.input}
      open={open}
      setOpen={setOpen}
      dropDownContainerStyle={styles.dropdown}
      listItemLabelStyle={styles.listItemLabel}
      containerProps={{
        style: styles.container,
      }}
      labelProps={{
        style: styles.label,
      }}
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  input: {
    padding: 12,
    backgroundColor: "transparent",
  },
  container: {
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: theme.colors.orange,
    backgroundColor: "transparent",
  },
  dropdown: {
    backgroundColor: theme.colors.background.tertiary,
    color: theme.colors.text.primary,
    borderWidth: 0,
    marginTop: 5,
  },
  listItemLabel: {
    color: theme.colors.text.primary,
  },
  label: {
    color: theme.colors.text.primary,
  },
}));

export default DropdownMenu;
