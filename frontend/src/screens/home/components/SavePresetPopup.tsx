import { useSavePreset } from "@/api/presets";
import { Button, Input, Popup, Text } from "@/ui/components";
import { PopupRef } from "@/ui/components/Popup";
import { withHaptics } from "@/utils/haptics";
import { mergeRefs } from "@/utils/ref";
import { Ref, useRef, useState } from "react";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { toast } from "sonner-native";

type SavePresetPopupProps = {
  ref: Ref<PopupRef>;
};

const SavePresetPopup = ({ ref }: SavePresetPopupProps) => {
  const innerRef = useRef<PopupRef>(null);
  const { theme } = useUnistyles();
  const [value, setValue] = useState("");
  const { mutateAsync: savePreset, isPending: isSaveAssetPending } =
    useSavePreset();

  const onSave = async () => {
    if (!value) return;
    try {
      await savePreset({ presetName: value });
      innerRef.current?.close();
    } catch {
      toast.error("Failed to save the preset");
    }
  };

  return (
    <Popup
      ref={mergeRefs(innerRef, ref)}
      style={styles.container}
      closeOnBackdropPress={false}
    >
      <Text variant="bold" size="H2">
        Save preset
      </Text>
      <Input
        placeholder="E.g. I wanna be like Metallica"
        label="Name"
        value={value}
        onChange={setValue}
      />
      <View style={styles.buttonsRow}>
        <Button
          title="Cancel"
          style={styles.buttonStyle}
          color={theme.colors.background.tertiary}
          onPress={() => innerRef.current?.close()}
        />
        <Button
          title="Save"
          style={styles.buttonStyle}
          loading={isSaveAssetPending}
          onPress={withHaptics(onSave)}
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
  buttonStyle: {
    flex: 1,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 8,
  },
});

export default SavePresetPopup;
