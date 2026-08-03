import { createContext, useContext } from "react";
import { SharedValue } from "react-native-reanimated";

export const SheetPositionContext =
  createContext<SharedValue<number> | null>(null);

export const useSheetTopPosition = () => useContext(SheetPositionContext);
