import AppProvider from "@/contexts/AppProvider";
import { Stack } from "expo-router";

export default function TabLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProvider>
  );
}
