import { useEngineConfig, useUpdateEngineConfig } from "@/api/config";
import { Button, IconButton, Input, Spinner } from "@/ui/components";
import ControlledDropdown from "@/ui/components/form/controlled/ControlledDropdownMenu";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import { SettingsContainer, SettingWrapper } from "./../shared";
import LatencyDetailsPopup from "./components/LatencyDetailsPopup";

import { PopupRef } from "@/ui/components/Popup";

type EngineConfigForm = {
  bufferSize: number;
};

const LatencyScreen = () => {
  const { data, isPending } = useEngineConfig();
  const { mutateAsync: updateConfig } = useUpdateEngineConfig();
  const popupRef = useRef<PopupRef>(null);
  const {
    control,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm<EngineConfigForm>();

  const options =
    data?.availableBufferSizes.map((item) => ({
      value: item,
      label: item.toString(),
    })) ?? [];

  const onSubmit = async (data: EngineConfigForm) => {
    try {
      await updateConfig(data);
      toast.success("Successfully changed latency settings");
    } catch {
      toast.error("Failed to update engine config");
    }
  };

  useEffect(() => {
    if (!data) return;
    reset({ bufferSize: data.bufferSize });
  }, [data, reset]);

  const samplingRateInKHz = (data?.sampleRate ?? 0) / 1000;

  return (
    <SettingsContainer title="Latency">
      <SettingWrapper>
        {isPending ? (
          <Spinner size="large" />
        ) : (
          <View style={styles.details}>
            <Input
              disabled
              value={`${samplingRateInKHz}kHz`}
              label="Sampling rate"
              description="Controls how often data is sampled"
            />
            <View>
              <IconButton
                onPress={() => popupRef.current?.open()}
                style={styles.iconStyle}
                iconName="information-outline"
                backgroundColor="transparent"
              />
              <ControlledDropdown
                label="Buffer size"
                description="Controls latency of audio processing"
                control={control as any}
                name="bufferSize"
                data={options}
              />
            </View>
          </View>
        )}
      </SettingWrapper>
      <Button
        title="Save"
        disabled={!isDirty}
        onPress={handleSubmit(onSubmit)}
      />
      <LatencyDetailsPopup ref={popupRef} />
    </SettingsContainer>
  );
};

const styles = StyleSheet.create({
  details: {
    gap: 8,
  },
  iconStyle: {
    zIndex: 2,
    position: "absolute",
    right: -8,
    top: -5,
  },
});

export default LatencyScreen;
