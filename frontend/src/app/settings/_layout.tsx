import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingsLayout = () => {
  return (
    <SafeAreaView>
      <Slot />
    </SafeAreaView>
  );
};

export default SettingsLayout;
