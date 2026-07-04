import {
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue,
} from "react-hook-form";
import SelectablePills, {
  SelectablePillConfig,
} from "../uncontrolled/SelectablePills";

type ArrayElement<T> = T extends (infer U)[] ? U : never;

type ControlledSelectablePillsProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> = {
  name: TName;
  control: Control<TFieldValues>;
  data: SelectablePillConfig<ArrayElement<PathValue<TFieldValues, TName>>>[];
};

const ControlledSelectablePills = <
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>({
  name,
  control,
  data,
}: ControlledSelectablePillsProps<TFieldValues, TName>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <SelectablePills data={data} values={value || []} onChange={onChange} />
      )}
    />
  );
};

export default ControlledSelectablePills;
