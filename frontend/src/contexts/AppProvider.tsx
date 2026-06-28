import WebSocketClient from "@/utils/websocket/WebSocketClient";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { ReactNode } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import { ConfirmationProvider } from "./ConfirmationProvider";
import { WebSocketClientProvider } from "./WebSocketProvider";

const queryClient = new QueryClient();
const socketClient = new WebSocketClient();

export default function AppProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView>
        <QueryClientProvider client={queryClient}>
          <WebSocketClientProvider client={socketClient}>
            <ConfirmationProvider>
              {children}
              <Toaster />
            </ConfirmationProvider>
          </WebSocketClientProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
