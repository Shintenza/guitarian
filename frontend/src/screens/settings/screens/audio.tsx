import {
  useAvailableConnections,
  useConnectPorts,
  useCurrentPortsConnections,
} from "@/api/ports";
import { ConnectPortsRequest } from "@/api/ports/types";
import {
  BackButton,
  Button,
  ControlledDropdownMenu,
  Spinner,
  Text,
} from "@/ui/components";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { Path, useForm } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { toast } from "sonner-native";
import { sharedStyles } from "./shared";

const AudioDevicesSettings = () => {
  const { back } = useRouter();
  const { theme } = useUnistyles();
  const { data: currentConnections, isPending: areCurrentConnectionsPending } =
    useCurrentPortsConnections();
  const { handleSubmit, control, reset } = useForm<ConnectPortsRequest>();
  const { mutateAsync: connectPorts, isPending: isConnectPortsPending } =
    useConnectPorts();

  const onSubmit = handleSubmit(async (data: ConnectPortsRequest) => {
    try {
      await connectPorts(data);
    } catch {
      toast.error("Failed to set audio devices");
    }
  });

  const { data: availableConnections, isPending: availableConnectionsPending } =
    useAvailableConnections();

  const sectionsProps = useMemo(
    () => [
      {
        title: "Audio input",
        description: "Select the device you connected your guitar to",
        control,
        name: "inputDevicePort",
        zIndex: 2,
        data: availableConnections?.inputPorts.map((item) => ({
          value: item,
          label: item,
        })),
      },
      {
        title: "Audio output",
        description: "Select one ore more output devices",
        name: "outputDevices",
        zIndex: 1,
        data: availableConnections?.outputDevices.map((item) => ({
          value: item,
          label: item,
        })),
        multiple: true,
      },
    ],
    [
      availableConnections?.inputPorts,
      availableConnections?.outputDevices,
      control,
    ],
  );

  useEffect(() => {
    if (!currentConnections) return;

    reset({
      inputDevicePort: currentConnections.input,
      outputDevices: currentConnections.outputs,
    });
  }, [currentConnections, reset]);

  const isLoading = areCurrentConnectionsPending || availableConnectionsPending;

  return (
    <View style={sharedStyles.container}>
      <View style={sharedStyles.header}>
        <BackButton onPress={back} />
        <Text size="H1">Audio devices</Text>
      </View>
      <View style={style.container}>
        {isLoading && <Spinner size="large" />}
        {!isLoading &&
          sectionsProps.map((section) => (
            <View style={style.section} key={section.name}>
              <View>
                <Text variant="semiBold">{section.title}</Text>
                <Text color={theme.colors.text.secondary} size="XS">
                  {section.description}
                </Text>
              </View>

              <ControlledDropdownMenu
                data={section.data ?? []}
                name={section.name as Path<ConnectPortsRequest>}
                control={control}
                zIndex={section.zIndex}
                multiple={section.multiple}
                rules={{ required: "Select a device" }}
              />
            </View>
          ))}
      </View>
      <Button title="Save" onPress={onSubmit} loading={isConnectPortsPending} />
    </View>
  );
};

const style = StyleSheet.create((theme) => ({
  container: {
    padding: 18,
    backgroundColor: theme.colors.background.secondary,
    gap: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  section: { gap: 8 },
  sectionHeader: {},
}));

export default AudioDevicesSettings;
