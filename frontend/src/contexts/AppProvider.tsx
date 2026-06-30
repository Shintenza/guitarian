import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { ReactNode } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import { ConfirmationProvider } from "./ConfirmationProvider";
import ConnectionProvider from "./ConnectionProvider";

const queryClient = new QueryClient();

export default function AppProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView>
        <QueryClientProvider client={queryClient}>
          <ConnectionProvider>
            <ConfirmationProvider>
              {children}
              <Toaster />
            </ConfirmationProvider>
          </ConnectionProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
