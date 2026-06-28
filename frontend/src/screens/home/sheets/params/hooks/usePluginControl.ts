import { useChainOptimistic } from "@/api/chain/utils";
import { useSocket } from "@/contexts/WebSocketProvider";
import { SetParamMessage } from "@/utils/websocket/types";
import throttle from "lodash.throttle";
import { useCallback, useMemo } from "react";
import useChainPlugin from "./useChainPlugin";

type UsePluginParamParams = {
  pluginId: string;
  controlId: number;
};
const usePluginControl = ({ pluginId, controlId }: UsePluginParamParams) => {
  const { plugin } = useChainPlugin(pluginId);
  const { updateControlOptimistically } = useChainOptimistic();
  const { client } = useSocket();

  const sendThrottledSetParamMessage = useCallback(
    // eslint-disable-next-line react-hooks/use-memo
    throttle((msg: SetParamMessage) => {
      client.sendMessage(msg);
    }, 150),
    [client],
  );

  const setValue = useCallback(
    (value: number) => {
      console.log("CHANGED: ", value);
      updateControlOptimistically(pluginId, controlId, value);
      const message: SetParamMessage = {
        action: "SetParam",
        pluginId: parseInt(pluginId),
        portId: controlId,
        value,
      };
      sendThrottledSetParamMessage(message);
    },
    [
      controlId,
      pluginId,
      sendThrottledSetParamMessage,
      updateControlOptimistically,
    ],
  );

  const controlMetadata = useMemo(
    () =>
      plugin?.metadata.controlsMetadata.find((item) => item.id === controlId),
    [controlId, plugin?.metadata.controlsMetadata],
  );

  const controlState = useMemo(
    () => plugin?.controlsState.find((item) => item.id === controlId),
    [controlId, plugin?.controlsState],
  );

  return {
    type: controlMetadata?.controlType,
    name: controlMetadata?.name,
    value: controlState?.value,
    minValue: controlMetadata?.minValue,
    maxValue: controlMetadata?.maxValue,
    scalePoints: controlMetadata?.scalePoints,
    setValue,
  };
};

export default usePluginControl;
