import AppProvider from "@/contexts/AppProvider";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}></Stack>
    </AppProvider>
  );
}
