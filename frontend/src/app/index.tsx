import { useCurrentChain } from "@/api/chain";
import useFindServer from "@/utils/api/useFindServer";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function EntryScreen() {
  const { isPending, data } = useCurrentChain();
  const { connection, isScanning } = useFindServer();

  useEffect(() => {
    console.log("IS PENDING: ", isPending, data);
  }, [isPending, data]);

  useEffect(() => {
    if ((connection || !isScanning) && !isPending) {
      SplashScreen.hide();
    }
  }, [connection, isPending, isScanning]);

  // TODO redirect to connection screen
  if (!connection && !isScanning) return <></>;

  if (connection && !isPending) {
    return <Redirect href={"/home"} />;
  }

  return null;
}
