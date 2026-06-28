import { DropdownMenu, Text } from "@/ui/components";
import Slider from "@expo/ui/community/slider";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import usePluginControl from "../hooks/usePluginControl";

type ParamControlProps = {
  pluginId: string;
  controlId: number;
};
const ParamControl = ({ controlId, pluginId }: ParamControlProps) => {
  const { theme } = useUnistyles();
  const {
    value,
    name,
    type,
    minValue,
    maxValue,
    scalePoints = [],
    setValue,
  } = usePluginControl({
    pluginId,
    controlId,
  });
  return (
    <View style={styles.container}>
      <Text>{name}</Text>
      {type === "Continuous" && (
        <Slider
          minimumValue={minValue}
          maximumValue={maxValue}
          value={value}
          onValueChange={setValue}
          thumbTintColor={theme.colors.orange}
          minimumTrackTintColor={theme.colors.orange}
        />
      )}
      {type === "Enumeration" && (
        <DropdownMenu
          zIndex={1000 - controlId}
          data={scalePoints}
          value={value!}
          onChange={setValue}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {},
}));

export default ParamControl;
