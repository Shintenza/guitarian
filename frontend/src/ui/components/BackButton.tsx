import { useUnistyles } from "react-native-unistyles";
import IconButton from "./IconButton";

type BackButtonProps = {
  onPress?: () => void;
};
const BackButton = ({ onPress }: BackButtonProps) => {
  const { theme } = useUnistyles();
  return (
    <IconButton
      onPress={onPress}
      iconName="chevron-left"
      backgroundColor={theme.colors.background.secondary}
      containerStyle={{
        padding: 0,
      }}
      iconSize={32}
    />
  );
};

export default BackButton;
