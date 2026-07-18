import useAutoRefetchQueries from "@/utils/api/useAutoRefetchQueries";
import useConnectionHandler, {
  UseConnectionHandlerResult,
} from "@/utils/api/useConnectionHandler";
import { createContext, ReactNode, useContext } from "react";

type ConnectionContextType = UseConnectionHandlerResult;
const ConnectionContext = createContext<ConnectionContextType | null>(null);

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnection must be used inside of ConnectionProvider");
  }
  return context;
};

const ConnectionProvider = ({ children }: { children: ReactNode }) => {
  const connectionHanlder = useConnectionHandler();
  useAutoRefetchQueries({ isConnected: connectionHanlder.isConnected });

  return (
    <ConnectionContext.Provider value={connectionHanlder}>
      {children}
    </ConnectionContext.Provider>
  );
};

export default ConnectionProvider;
