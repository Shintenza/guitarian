import { ActivityIndicator, ActivityIndicatorProps } from "react-native";
import { useUnistyles } from "react-native-unistyles";

type SpinnerProps = ActivityIndicatorProps;

const Spinner = ({ color, ...rest }: SpinnerProps) => {
  const { theme } = useUnistyles();
  return <ActivityIndicator color={color ?? theme.colors.orange} {...rest} />;
};

export default Spinner;
