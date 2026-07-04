import SliderComponent, {
  SliderProps as SliderComponentProps,
} from "@expo/ui/community/slider";
import { useUnistyles } from "react-native-unistyles";
type SliderProps = Omit<SliderComponentProps, "onChange"> & {
  onChange: (value: number) => void;
};
const Slider = ({ onChange, ...rest }: SliderProps) => {
  const { theme } = useUnistyles();
  return (
    <SliderComponent
      onValueChange={onChange}
      thumbTintColor={theme.colors.orange}
      minimumTrackTintColor={theme.colors.orange}
      {...rest}
    />
  );
};

export default Slider;
