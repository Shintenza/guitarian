import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Ref, useImperativeHandle, useRef, useState } from "react";
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
    >
      {plugin && <PluginParamsEditor plugin={plugin} />}
    </HomeScreenSheet>
  );
};

export default ParamsSheet;
