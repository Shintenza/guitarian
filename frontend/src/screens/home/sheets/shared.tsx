import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { ReactNode, Ref } from "react";
import { useUnistyles } from "react-native-unistyles";

export type HomeScreenSheetProps = {
  ref: Ref<TrueSheet>;
  children: ReactNode;
  onWillDismiss?: TrueSheet["onWillDismiss"];
  onDidPresent?: TrueSheet["onDidPresent"];
  onDetentChange?: TrueSheet["onDetentChange"];
  onPositionChange?: TrueSheet["onPositionChange"];
};

export const HomeScreenSheet = ({
  ref,
  children,
  onWillDismiss,
  onDidPresent,
  onDetentChange,
  onPositionChange,
}: HomeScreenSheetProps) => {
  const { theme } = useUnistyles();

  return (
    <TrueSheet
      ref={ref}
      detents={[0.5, 0.8]}
      scrollable
      backgroundColor={theme.colors.background.secondary}
      onWillDismiss={onWillDismiss}
      onDidPresent={onDidPresent}
      onDetentChange={onDetentChange}
      onPositionChange={onPositionChange}
    >
      {children}
    </TrueSheet>
  );
};
