import { ChainPlugin } from "@/types/plugins";
import { Text } from "@/ui/components";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ParamControl from "./ParamControl";

type SheetParamsEditorProps = {
  plugin: ChainPlugin;
};

const PluginParamsEditor = ({ plugin }: SheetParamsEditorProps) => {
  return (
    <ScrollView contentContainerStyle={styles.contentContainerStyle}>
      <Text size="H1">{plugin.metadata.name}</Text>
      <View style={styles.controlsContainer}>
        {plugin.controlsState.map((control) => (
          <ParamControl
            pluginId={plugin.id}
            controlId={control.id}
            key={control.id}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create((theme) => ({
  contentContainerStyle: {
    paddingVertical: 24,
    gap: 24,
    paddingHorizontal: 24,
  },
  controlsContainer: {
    gap: 18,
  },
}));

export default PluginParamsEditor;
