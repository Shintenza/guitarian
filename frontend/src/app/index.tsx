import { useCurrentChain } from "@/api/chain";
import { useSocket } from "@/contexts/WebSocketProvider";
import useFindServer from "@/utils/api/useFindServer";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function EntryScreen() {
  const { isPending } = useCurrentChain();
  const { connection, isScanning } = useFindServer();
  const { connect, isConnected } = useSocket();

  useEffect(() => {
    console.log("IS SOCKED CONNECTED: ", isConnected);
  }, [isConnected]);

  useEffect(() => {
    if (!connection) return;
    connect(connection);
  }, [connection, connect]);

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
