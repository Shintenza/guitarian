import { useCallback } from "react";
import { ParamAckFailureListener, paramAckTracker } from "./ParamAckTracker";

const useParamAckTracker = () => {
  const register = useCallback(
    (pluginId: number, portId: number, value: number) =>
      paramAckTracker.register(pluginId, portId, value),
    [],
  );

  const ack = useCallback(
    (pluginId: number, portId: number, value: number) =>
      paramAckTracker.ack(pluginId, portId, value),
    [],
  );

  const subscribeFailures = useCallback(
    (listener: ParamAckFailureListener) =>
      paramAckTracker.subscribeFailures(listener),
    [],
  );

  return { register, ack, subscribeFailures };
};

export default useParamAckTracker;
