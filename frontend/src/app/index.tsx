import useFindServer from "@/utils/api/useFindServer";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function EntryScreen() {
  const { connection, isScanning } = useFindServer();

  useEffect(() => {
    if (connection || !isScanning) {
      SplashScreen.hide();
    }
  }, [connection, isScanning]);

  // TODO redirect to connection screen
  if (!connection && !isScanning) return <></>;

  if (connection) {
    return <Redirect href={"/home"} />;
  }

  return null;
}
