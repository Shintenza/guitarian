import {
  Control,
  Controller,
  ControllerProps,
  FieldValues,
  Path,
} from "react-hook-form";
import Input, { InputProps } from "../uncontrolled/Input";

type ControlledInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  rules?: ControllerProps<T>["rules"];
} & Omit<InputProps, "value" | "onChange">;

const ControlledInput = <T extends FieldValues>({
  name,
  control,
  rules,
  ...rest
}: ControlledInputProps<T>) => {
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field: { value, onChange } }) => (
        <Input value={value} onChange={onChange} {...rest} />
      )}
    />
  );
};

export default ControlledInput;
