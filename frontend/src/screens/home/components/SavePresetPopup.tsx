import { useSavePreset, useUpdatePreset } from "@/api/presets";
import { usePresetStore } from "@/stores/preset";
import { Button, ControlledInput, Popup, Text } from "@/ui/components";
import { PopupRef } from "@/ui/components/Popup";
import { withHaptics } from "@/utils/haptics";
import { mergeRefs } from "@/utils/ref";
import { Ref, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { toast } from "sonner-native";

type PresetForm = {
  name: string;
};

type SavePresetPopupProps = {
  ref: Ref<PopupRef>;
};

const SavePresetPopup = ({ ref }: SavePresetPopupProps) => {
  const innerRef = useRef<PopupRef>(null);
  const { name, id, isDirty: isPresetModified } = usePresetStore();
  const { theme } = useUnistyles();
  const {
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
  } = useForm<PresetForm>({
    defaultValues: { name },
  });
  const { mutateAsync: savePreset, isPending: isSaveAssetPending } =
    useSavePreset();
  const { mutateAsync: updatePreset, isPending: isUpdatePresetPending } =
    useUpdatePreset();

  const onSave = async ({ name }: PresetForm) => {
    if (!name) return;

    try {
      if (isDirty) {
        await savePreset({ presetName: name });
      } else if (!isDirty && id) {
        await updatePreset({
          presetName: name,
          id,
          updatePresetChain: isPresetModified,
        });
      }
      const action = isDirty ? "saved" : "updated";
      toast.success(`Successfully ${action} preset`);
      innerRef.current?.close();
    } catch {
      const action = isDirty ? "save" : "update";
      toast.error(`Failed to ${action} the preset`);
    }
  };

  useEffect(() => {
    reset({ name });
  }, [name, reset]);

  const buttonTitle = isDirty ? "Create new" : "Update current preset";

  return (
    <Popup
      ref={mergeRefs(innerRef, ref)}
      style={styles.container}
      closeOnBackdropPress={false}
    >
      <Text variant="bold" size="H2">
        Save preset
      </Text>
      <ControlledInput
        control={control}
        name="name"
        placeholder="E.g. I wanna be like Metallica"
        label="Name"
        rules={{ required: "Name is required" }}
      />
      <View style={styles.buttonsRow}>
        <Button
          title="Cancel"
          color={theme.colors.background.tertiary}
          onPress={() => innerRef.current?.close()}
        />
        <Button
          title={buttonTitle}
          loading={isSaveAssetPending || isUpdatePresetPending}
          // eslint-disable-next-line react-hooks/refs
          onPress={withHaptics(handleSubmit(onSave))}
        />
      </View>
    </Popup>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    minWidth: 300,
  },
  buttonsRow: {
    gap: 8,
  },
});

export default SavePresetPopup;
