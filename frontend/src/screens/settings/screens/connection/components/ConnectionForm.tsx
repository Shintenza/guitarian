import { useConnection } from "@/contexts/ConnectionProvider";
import { ConnectionConfig, useConnectionStore } from "@/stores/connection";
import { Button, ControlledInput } from "@/ui/components";
import { IPv4_WITH_PORT } from "@/utils/regex";
import { connectionConfigToHostAddress } from "@/utils/url";
import { useForm } from "react-hook-form";
import { useUnistyles } from "react-native-unistyles";
import { toast } from "sonner-native";
import { SettingWrapper } from "../../shared";

type ConenctionFormProps = {
  onCancel: () => void;
};

type ConnectionFormData = {
  address: string;
};

const ConnectionForm = ({ onCancel }: ConenctionFormProps) => {
  const { setConnection, connection } = useConnectionStore();
  const { connectAsync, isConnected } = useConnection();
  const { theme } = useUnistyles();

  const {
    control,
    formState: { isDirty },
    handleSubmit,
  } = useForm<ConnectionFormData>({
    defaultValues: {
      address: connection
        ? connectionConfigToHostAddress(connection)
        : undefined,
    },
  });

  const isButtonDisabled = isConnected && !isDirty;

  const onSubmit = async ({ address }: ConnectionFormData) => {
    const splitAddress = address.split(":");
    const host = splitAddress[0];
    const port = Number.parseInt(splitAddress[1]);

    if (!host || Number.isNaN(port)) {
      toast.error("Invalid address format");
    }

    const connection: ConnectionConfig = {
      host,
      port,
    };

    try {
      await connectAsync(connection);
      setConnection(connection);
      toast.success("Successfully connected to the engine");
      onCancel();
    } catch {
      toast.error("Failed to establish connection");
    }
  };

  return (
    <>
      <SettingWrapper>
        <ControlledInput
          control={control}
          name="address"
          label="Connection address"
          rules={{
            required: "Address is required",
            pattern: {
              value: IPv4_WITH_PORT,
              message: "Provide valid IPv4 with port number",
            },
          }}
          description="Address of device running audio engine"
          placeholder="e.g. 192.168.0.1:3000"
        />
      </SettingWrapper>
      <Button onPress={onCancel} title="Cancel" color={theme.colors.red} />

      <Button
        title="Save and connect"
        disabled={isButtonDisabled}
        onPress={handleSubmit(onSubmit)}
      />
    </>
  );
};

export default ConnectionForm;
