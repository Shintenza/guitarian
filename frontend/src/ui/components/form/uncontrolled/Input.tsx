import Text from "@/ui/components/text/Text";
import { fonts } from "@/ui/typography";
import { TextInput, TextInputProps, View, ViewStyle } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type InputProps = {
  value: string;
  label?: string;
  containerStyle?: ViewStyle;
  onChange?: (value: string) => void;
} & Omit<TextInputProps, "onChange">;

const Input = ({
  value,
  label,
  containerStyle,
  onChange,
  ...rest
}: InputProps) => {
  const { theme } = useUnistyles();
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text>{label}</Text>}

      <TextInput
        value={value}
        onChangeText={onChange}
        style={styles.input}
        cursorColor={theme.colors.orange}
        placeholderTextColor={theme.colors.text.muted}
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: 6,
  },
  input: {
    fontFamily: fonts.InterRegular,
    borderColor: theme.colors.orange,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: theme.colors.text.primary,
  },
}));

export default Input;
