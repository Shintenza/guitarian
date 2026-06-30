import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

export type ConnectionConfig = {
  host: string;
  port: number;
};

type ConnectionStore = {
  connection: ConnectionConfig | null;
  _hydrated: boolean;
  _setHydrated: (hydrated: boolean) => void;
  setConnection: (connection: ConnectionConfig | null) => void;
  getIsHydrated: () => boolean;
};

export const connectionStore = create<ConnectionStore>()(
  persist(
    (set, get) => ({
      connection: null,
      _hydrated: false,

      setConnection: (connection) => set(() => ({ connection })),
      _setHydrated: (hydrated) => set({ _hydrated: hydrated }),
      getIsHydrated: () => get()._hydrated,
    }),
    {
      name: "config-store",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (!error) {
            state?._setHydrated(true);
          }
        };
      },
    },
  ),
);

export const useConnectionStore = () => {
  return connectionStore(
    useShallow((s) => ({
      connection: s.connection,
      hydrated: s._hydrated,
      setConnection: s.setConnection,
    })),
  );
};
