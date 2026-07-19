import { BlueprintGrid } from "@/ui/components";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useRef, useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ChainOverlay from "./components/ChainOverlay";
import ChainRenderer from "./components/chainRenderer";
import Header from "./components/Header";
import LibrarySheet from "./sheets/library";
import ParamsSheet, { ParamsSheetRef } from "./sheets/params";
import PresetsSheet from "./sheets/presets";

const HomeScreen = () => {
  const librarySheetRef = useRef<TrueSheet>(null);
  const presetsSheetRef = useRef<TrueSheet>(null);
  const paramsSheetRef = useRef<ParamsSheetRef>(null);
  const [isPresetsModalActive, setIsPresetsModalActive] = useState(false);

  return (
    <View style={styles.container}>
      <BlueprintGrid />
      <Header
        isPresetsModalActive={isPresetsModalActive}
        onPresetPress={async () => {
          setIsPresetsModalActive(true);
          await presetsSheetRef.current?.present();
        }}
      />
      <ChainRenderer
        onChainItemPress={(pluginId) => paramsSheetRef.current?.open(pluginId)}
        onAddPluginPress={() => librarySheetRef.current?.present()}
      />
      <LibrarySheet ref={librarySheetRef} />
      <PresetsSheet
        ref={presetsSheetRef}
        onWillDismiss={() => setIsPresetsModalActive(false)}
      />
      <ParamsSheet ref={paramsSheetRef} />
      <ChainOverlay />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
  },
  buttonContainer: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
}));

export default HomeScreen;
