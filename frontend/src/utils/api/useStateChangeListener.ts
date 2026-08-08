import CHAIN_KEYS from "@/api/chain/chain.keys";
import { useChainOptimistic } from "@/api/chain/utils";
import CONFIG_KEYS from "@/api/config/config.keys";
import PORTS_KEYS from "@/api/ports/ports.keys";
import { ChainPlugin } from "@/types/plugins";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import {
  isStateChangeEvent,
  StateChangeEvent,
  StateChangeEventType,
} from "../websocket/types";
import useParamAckTracker from "../websocket/useParamAckTracker";
import useWebsocket from "../websocket/useWebsocket";

const useStateChangeListener = () => {
  const { subscribe } = useWebsocket();
  const { ack, subscribeFailures } = useParamAckTracker();
  const { updateControlOptimistically } = useChainOptimistic();
  const queryClient = useQueryClient();

  const refetchChain = useCallback(
    () =>
      queryClient.refetchQueries({ queryKey: CHAIN_KEYS.GET_CURRENT_CHAIN }),
    [queryClient],
  );

  useEffect(() => {
    const unsubscribeFailures = subscribeFailures(() => refetchChain());
    return () => {
      unsubscribeFailures();
    };
  }, [refetchChain, subscribeFailures]);

  useEffect(() => {
    const getCachedChain = () =>
      queryClient.getQueryData<ChainPlugin[]>(CHAIN_KEYS.GET_CURRENT_CHAIN);

    const handleEvent = (event: StateChangeEvent) => {
      switch (event.type) {
        case StateChangeEventType.Cleared:
        case StateChangeEventType.PresetLoaded:
          refetchChain();
          return;

        case StateChangeEventType.PluginLoaded: {
          const chain = getCachedChain();
          const current = chain?.[event.payload.position];
          if (current?.metadata.uri !== event.payload.pluginUri) {
            refetchChain();
          }
          return;
        }

        case StateChangeEventType.PluginPositionChanged: {
          const chain = getCachedChain();
          const current = chain?.[event.payload.newPosition];
          if (current?.id !== String(event.payload.pluginId)) {
            refetchChain();
          }
          return;
        }

        case StateChangeEventType.PluginUnloaded: {
          const chain = getCachedChain();
          const isStillInChain = chain?.some(
            (item) => item.id === String(event.payload.pluginId),
          );
          if (isStillInChain) {
            refetchChain();
          }
          return;
        }

        case StateChangeEventType.ConnectionsChanged:
          queryClient.refetchQueries({
            queryKey: PORTS_KEYS.getCurrentConnections,
          });
          return;

        case StateChangeEventType.BufferSizeChanged:
          queryClient.refetchQueries({
            queryKey: CONFIG_KEYS.getEngineConfig,
          });
          return;

        case StateChangeEventType.ParamChanged: {
          const { pluginId, portId, newValue } = event.payload;
          const wasPending = ack(pluginId, portId, newValue);
          if (!wasPending) {
            updateControlOptimistically(String(pluginId), portId, newValue);
          }
          return;
        }
      }
    };

    const unsubscribe = subscribe((data) => {
      if (isStateChangeEvent(data)) {
        handleEvent(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [ack, queryClient, refetchChain, subscribe, updateControlOptimistically]);
};

export default useStateChangeListener;
