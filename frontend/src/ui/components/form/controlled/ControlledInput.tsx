import { Control, Controller, FieldValues, Path } from "react-hook-form";
import Input, { InputProps } from "../uncontrolled/Input";

type ControlledInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
} & Omit<InputProps, "value" | "onChange">;

const ControlledInput = <T extends FieldValues>({
  name,
  control,
  ...rest
}: ControlledInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <Input value={value} onChange={onChange} {...rest} label="Name" />
      )}
    />
  );
};

export default ControlledInput;
