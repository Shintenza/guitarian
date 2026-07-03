import { useAllPresets, useDeletePreset, useLoadPreset } from "@/api/presets";
import { useConfirm } from "@/contexts/ConfirmationProvider";
import { usePresetStore } from "@/stores/preset";
import { PresetListItem, Spinner, Text } from "@/ui/components";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import { HomeScreenSheet, HomeScreenSheetProps } from "./../shared";

type PresetsSheetProps = Omit<HomeScreenSheetProps, "children">;

const PresetsSheet = (props: PresetsSheetProps) => {
  const { data, isPending } = useAllPresets();
  const { id: activePresetId } = usePresetStore();
  const { confirm } = useConfirm();
  const { mutateAsync: deletePreset } = useDeletePreset();

  const {
    mutateAsync: loadPreset,
    variables: loadPresetVariables,
    isPending: isLoadPresetPending,
  } = useLoadPreset();

  const showEmptyMessage = data?.length === 0 && !isPending;
  const isContentMissing = showEmptyMessage || isPending;

  const onPresetLoad = async (id: number) => {
    try {
      await loadPreset({ presetId: id });
    } catch {
      toast.error("Failed to load the preset");
    }
  };

  const onPresetDelete = async (id: number) => {
    await confirm({
      onConfirm: async () => {
        try {
          await deletePreset({ presetId: id });
        } catch {
          toast.error("Failed to delete the preset");
        }
      },
    });
  };

  return (
    <HomeScreenSheet {...props}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="bold" size="H1">
          Presets
        </Text>
        {isContentMissing && (
          <View style={styles.spinnerContainer}>
            {isPending && <Spinner size="large" />}
            {showEmptyMessage && <Text>You have not created any presets</Text>}
          </View>
        )}
        <View style={styles.presetsContainer}>
          {data?.map((preset) => (
            <PresetListItem
              name={preset.name}
              key={preset.id}
              onPress={() => onPresetLoad(preset.id)}
              active={preset.id === activePresetId}
              onDelete={() => onPresetDelete(preset.id)}
              loading={
                loadPresetVariables?.presetId === preset.id &&
                isLoadPresetPending
              }
            />
          ))}
        </View>
      </ScrollView>
    </HomeScreenSheet>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: 24,
    gap: 24,
  },
  spinnerContainer: {
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  presetsContainer: {
    gap: 4,
  },
}));

export default PresetsSheet;
