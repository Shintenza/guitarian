import { BlueprintGrid, IconButton } from "@/ui/components";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import ChainRenderer from "./components/chainRenderer";
import LibrarySheet from "./sheets/library";

const HomeScreen = () => {
  const librarySheetRef = useRef<TrueSheet>(null);

  return (
    <SafeAreaView style={styles.container}>
      <BlueprintGrid />
      <ChainRenderer />
      <LibrarySheet ref={librarySheetRef} />
      <IconButton
        iconName="plus"
        size="huge"
        containerStyle={styles.buttonContainer}
        onPress={async () => await librarySheetRef.current?.present()}
      />
    </SafeAreaView>
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
