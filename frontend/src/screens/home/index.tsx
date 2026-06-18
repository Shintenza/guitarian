import { BlueprintGrid } from "@/ui/components";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useRef } from "react";
import { Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import LibraryScreen from "../library";
import ChainRenderer from "./components/chainRenderer";

const HomeScreen = () => {
  const sheet = useRef<TrueSheet>(null);
  const { theme } = useUnistyles();

  return (
    <SafeAreaView style={styles.container}>
      <BlueprintGrid />
      <Button
        title="Test"
        onPress={async () => await sheet.current?.present()}
      />
      <ChainRenderer />
      <TrueSheet
        ref={sheet}
        detents={[0.5, 0.8]}
        initialDetentIndex={0}
        scrollable
        backgroundColor={theme.colors.background.secondary}
      >
        <LibraryScreen />
      </TrueSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
  },
}));

export default HomeScreen;
