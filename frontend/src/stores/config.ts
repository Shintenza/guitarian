import { create } from "zustand";

type ConnectionConfig = {
  host: string;
  port: number;
};

type ConfigStore = {
  connection: ConnectionConfig | null;

  setConnection: (connection: ConnectionConfig) => void;
};

export const configStore = create<ConfigStore>((set) => ({
  connection: null,
  setConnection: (connection) =>
    set((state) => ({
      connection: {
        ...state.connection,
        ...connection,
      },
    })),
}));

export const useConfigStore = () => {
  const setConnection = configStore((state) => state.setConnection);
  const connection = configStore((state) => state.connection);

  return { connection, setConnection };
};
