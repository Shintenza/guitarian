import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { ReactNode, Ref } from "react";
import { useUnistyles } from "react-native-unistyles";

export type HomeScreenSheetProps = {
  ref: Ref<TrueSheet>;
  children: ReactNode;
};

export const HomeScreenSheet = ({ ref, children }: HomeScreenSheetProps) => {
  const { theme } = useUnistyles();

  return (
    <TrueSheet
      ref={ref}
      detents={[0.5, 0.8]}
      scrollable
      backgroundColor={theme.colors.background.secondary}
    >
      {children}
    </TrueSheet>
  );
};
