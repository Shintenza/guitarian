import {
  Switch as SwitchComponent,
  SwitchProps as SwitchComponentProps,
} from "react-native";
import { useUnistyles } from "react-native-unistyles";

type SwitchProps = Omit<SwitchComponentProps, "onChange"> & {
  onChange: (value: boolean) => void;
};

const Switch = ({ onChange, ...props }: SwitchProps) => {
  const { theme } = useUnistyles();
  return (
    <SwitchComponent
      thumbColor={theme.colors.orange}
      trackColor={{
        true: theme.colors.darkOrange,
        false: theme.colors.background.tertiary,
      }}
      {...props}
      onValueChange={onChange}
    />
  );
};

export default Switch;
