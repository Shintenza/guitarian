import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useLatestRef } from "./ref";

type UseAppStateChangeParams = {
  onSleep?: () => void;
  onWake?: () => void;
};

export const useAppStateChange = ({
  onSleep,
  onWake,
}: UseAppStateChangeParams) => {
  const appState = useRef(AppState.currentState);
  const onSleepRef = useLatestRef(onSleep);
  const onWakeRef = useLatestRef(onWake);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        onWakeRef.current?.();
      }

      if (
        appState.current === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        onSleepRef.current?.();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [onSleepRef, onWakeRef]);
};
