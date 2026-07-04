import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { DropDownPickerProps } from "react-native-dropdown-picker";
import Input from "../uncontrolled/Input";

type ControlledInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
} & Omit<DropDownPickerProps<T>, "value" | "onChange">;

const ControlledInput = <T extends FieldValues>({
  name,
  control,
}: ControlledInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <Input value={value} onChange={onChange} />
      )}
    />
  );
};

export default ControlledInput;
