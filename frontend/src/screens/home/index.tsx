import { BlueprintGrid } from "@/ui/components";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useRef, useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ChainRenderer from "./components/chainRenderer";
import Controls from "./components/Controls";
import Header from "./components/Header";
import LibrarySheet from "./sheets/library";
import PresetsSheet from "./sheets/presets";

const HomeScreen = () => {
  const librarySheetRef = useRef<TrueSheet>(null);
  const presetsSheetRef = useRef<TrueSheet>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPresetsModalActive, setIsPresetsModalActive] = useState(false);

  return (
    <View style={styles.container}>
      <Header
        isPresetsModalActive={isPresetsModalActive}
        onEdit={() => setIsEditMode(true)}
        onPresetPress={async () => {
          setIsPresetsModalActive(true);
          await presetsSheetRef.current?.present();
        }}
      />
      <BlueprintGrid />
      <ChainRenderer isEditMode={isEditMode} />
      <LibrarySheet ref={librarySheetRef} />
      <PresetsSheet
        ref={presetsSheetRef}
        onWillDismiss={() => setIsPresetsModalActive(false)}
      />
      <Controls
        isEditMode={isEditMode}
        onCancelEdit={() => setIsEditMode(false)}
        onAddPress={async () => await librarySheetRef.current?.present()}
      />
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
