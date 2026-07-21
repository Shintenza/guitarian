import {
  Control,
  Controller,
  ControllerProps,
  FieldValues,
  Path,
  PathValue,
} from "react-hook-form";
import DropdownMenu, { DropdownMenuProps } from "../uncontrolled/DropdownMenu";

type ArrayElement<T> = T extends (infer U)[] ? U : never;
type ControlledInputProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> = {
  name: TName;
  control: Control<TFieldValues>;
  rules?: ControllerProps<TFieldValues>["rules"];
} & Omit<
  DropdownMenuProps<ArrayElement<PathValue<TFieldValues, TName>>>,
  "value" | "onChange"
>;

const ControlledDropdown = <
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>({
  name,
  control,
  rules,
  ...rest
}: ControlledInputProps<TFieldValues, TName>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <DropdownMenu
          value={value}
          onChange={onChange}
          {...rest}
          error={error?.message}
        />
      )}
    />
  );
};

export default ControlledDropdown;
