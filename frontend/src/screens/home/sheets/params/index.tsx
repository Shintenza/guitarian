import { SheetPositionContext } from "@/contexts/SheetPositionContext";
import {
  DetentChangeEvent,
  DidPresentEvent,
  PositionChangeEvent,
  TrueSheet,
} from "@lodev09/react-native-true-sheet";
import { Ref, useImperativeHandle, useRef, useState } from "react";
import { useSharedValue } from "react-native-reanimated";
import { HomeScreenSheet } from "../shared";
import PluginParamsEditor from "./components/PluginParamsEditor";
import useChainPlugin from "./hooks/useChainPlugin";

export type ParamsSheetRef = {
  open: (pluginId: string) => void;
  close: () => void;
};

type ParamsSheetProps = {
  ref: Ref<ParamsSheetRef>;
};

const ParamsSheet = ({ ref }: ParamsSheetProps) => {
  const [activePluginId, setActivePluginId] = useState<null | string>(null);
  const { plugin } = useChainPlugin(activePluginId);

  const sheetRef = useRef<TrueSheet>(null);
  const sheetTopPosition = useSharedValue(0);

  useImperativeHandle(ref, () => ({
    open: (pluginId) => {
      setActivePluginId(pluginId);
      sheetRef.current?.present();
    },
    close: () => {
      setActivePluginId(null);
    },
  }));

  return (
    <HomeScreenSheet
      ref={sheetRef}
      onWillDismiss={() => setActivePluginId(null)}
      onDidPresent={(e: DidPresentEvent) => {
        sheetTopPosition.value = e.nativeEvent.position;
      }}
      onDetentChange={(e: DetentChangeEvent) => {
        sheetTopPosition.value = e.nativeEvent.position;
      }}
      onPositionChange={(e: PositionChangeEvent) => {
        sheetTopPosition.value = e.nativeEvent.position;
      }}
    >
      <SheetPositionContext.Provider value={sheetTopPosition}>
        {plugin && <PluginParamsEditor plugin={plugin} />}
      </SheetPositionContext.Provider>
    </HomeScreenSheet>
  );
};

export default ParamsSheet;
