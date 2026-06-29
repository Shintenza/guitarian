import { ControlType } from "@/types/plugins";
import { DropdownMenu, Slider, Switch, Text } from "@/ui/components";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import usePluginControl from "../hooks/usePluginControl";

type ParamControlProps = {
  pluginId: string;
  controlId: number;
};
const ParamControl = ({ controlId, pluginId }: ParamControlProps) => {
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
    <View style={styles.container({ type })}>
      <Text>{name}</Text>
      {(type === "Continuous" || type === "Integer") && (
        <Slider
          minimumValue={minValue}
          maximumValue={maxValue}
          step={type === "Integer" ? 1 : undefined}
          value={value}
          onChange={setValue}
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
      {type === "Toggled" && (
        <Switch value={Boolean(value)} onChange={(e) => setValue(Number(e))} />
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: ({ type }: { type?: ControlType }) => ({
    ...(type === "Toggled"
      ? {
          flexDirection: "row",
          justifyContent: "space-between",
        }
      : {}),

    gap: 6,
  }),
}));

export default ParamControl;
