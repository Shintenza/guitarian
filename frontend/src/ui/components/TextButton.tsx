import { withHaptics } from "@/utils/haptics";
import { Pressable, ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { TextProps } from "./text";
import Text from "./text/Text";

type LinkProps = {
  title: string;
  onPress?: () => void;
  containerStyle?: ViewStyle;
} & TextProps;

const TextButton = ({ title, containerStyle, onPress, ...rest }: LinkProps) => {
  return (
    <Pressable onPress={withHaptics(onPress)} style={containerStyle}>
      <Text style={styles.text} {...rest}>
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  text: {
    textDecorationLine: "underline",
  },
});

export default TextButton;
