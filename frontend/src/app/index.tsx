import { useCurrentChain } from "@/api/chain";
import { useConnection } from "@/contexts/ConnectionProvider";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function EntryScreen() {
  const { isConnected } = useConnection();
  const { isPending } = useCurrentChain();

  const isAppReady = isConnected && !isPending;

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hide();
    }
  }, [isAppReady]);

  if (isAppReady) {
    return <Redirect href={"/home"} />;
  }

  return null;
}
