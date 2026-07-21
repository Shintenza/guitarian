import Text from "@/ui/components/text/Text";
import { fonts } from "@/ui/typography";
import { TextInput, TextInputProps, View, ViewStyle } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type InputProps = {
  value: string;
  label?: string;
  description?: string;
  error?: string;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  onChange?: (value: string) => void;
} & Omit<TextInputProps, "onChange">;

const Input = ({
  value,
  label,
  containerStyle,
  disabled,
  description,
  error,
  onChange,
  ...rest
}: InputProps) => {
  const { theme } = useUnistyles();
  return (
    <View style={[styles.container, containerStyle]}>
      <View>
        {label && <Text>{label}</Text>}
        {description && (
          <Text size="XS" color={theme.colors.text.secondary}>
            {description}
          </Text>
        )}
      </View>

      <View>
        <TextInput
          editable={!disabled}
          value={value}
          onChangeText={onChange}
          style={styles.input({ disabled })}
          cursorColor={theme.colors.orange}
          placeholderTextColor={theme.colors.text.muted}
          {...rest}
        />
        {error && (
          <Text size="XS" color={theme.colors.red}>
            {error}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: 8,
  },
  input: ({ disabled }: { disabled?: boolean }) => ({
    fontFamily: fonts.InterRegular,
    borderColor: disabled ? theme.colors.border : theme.colors.orange,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: disabled ? theme.colors.text.secondary : theme.colors.text.primary,
  }),
}));

export default Input;
