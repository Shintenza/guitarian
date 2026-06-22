import { Text } from "@/ui/components";
import { ScrollView } from "react-native";
import { HomeScreenSheet, HomeScreenSheetProps } from "./shared";

type PresetsSheetProps = Omit<HomeScreenSheetProps, "children">;

const PresetsSheet = (props: PresetsSheetProps) => {
  return (
    <HomeScreenSheet {...props}>
      <ScrollView>
        <Text variant="bold" size="H1">
          Presets
        </Text>
      </ScrollView>
    </HomeScreenSheet>
  );
};

export default PresetsSheet;
