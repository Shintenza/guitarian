import { Button, Text, TextButton } from "@/ui/components";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type ConnectionErrorProps = {
  title: string;
  description: string;
  onRetry?: () => void;
  alternativeAction?: {
    title: string;
    onPress: () => void;
  };
};

const ConnectionError = ({
  title,
  description,
  alternativeAction,
  onRetry,
}: ConnectionErrorProps) => {
  const { theme } = useUnistyles();
  return (
    <View style={styles.container}>
      <MaterialDesignIcons
        name="connection"
        color={theme.colors.text.primary}
        size={48}
        style={{ alignSelf: "center" }}
      />
      <View style={styles.textContainer}>
        <Text size="H3">{title}</Text>
        <Text size="XS" color={theme.colors.text.secondary}>
          {description}
        </Text>
      </View>
      <View style={styles.bottom}>
        <Button title="Try again" onPress={onRetry} style={styles.button} />
        {alternativeAction && (
          <TextButton
            containerStyle={styles.alternativeButtonContainer}
            size="XS"
            title={alternativeAction.title}
            onPress={alternativeAction.onPress}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    alignItems: "center",
  },
  bottom: {
    gap: 8,
  },
  button: {},
  alternativeButtonContainer: {
    alignSelf: "center",
  },
  container: {
    gap: 18,
  },
});

export default ConnectionError;
