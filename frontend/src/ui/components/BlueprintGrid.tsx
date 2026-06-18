import { View } from "react-native";
import Svg, { Defs, Path, Pattern, Rect } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export interface GridBackgroundProps {
  smallGridSize?: number;
  largeGridSize?: number;
  minorLineColor?: string;
  majorLineColor?: string;
  backgroundColor?: string;
}

const BlueprintGrid = ({
  smallGridSize = 20,
  largeGridSize = 100,
  minorLineColor = "rgba(255, 255, 255, 0.03)",
  majorLineColor = "rgba(255, 255, 255, 0.08)",
  backgroundColor,
}: GridBackgroundProps) => {
  const { theme } = useUnistyles();

  const resolvedBgColor = backgroundColor || theme.colors.background.main;

  return (
    <View
      style={[styles.absoluteContainer, { backgroundColor: resolvedBgColor }]}
      pointerEvents="none"
    >
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="smallGrid"
            width={smallGridSize}
            height={smallGridSize}
            patternUnits="userSpaceOnUse"
          >
            <Path
              d={`M ${smallGridSize} 0 L 0 0 0 ${smallGridSize}`}
              fill="none"
              stroke={minorLineColor}
              strokeWidth="1"
            />
          </Pattern>

          <Pattern
            id="grid"
            width={largeGridSize}
            height={largeGridSize}
            patternUnits="userSpaceOnUse"
          >
            <Rect
              width={largeGridSize}
              height={largeGridSize}
              fill="url(#smallGrid)"
            />
            <Path
              d={`M ${largeGridSize} 0 L 0 0 0 ${largeGridSize}`}
              fill="none"
              stroke={majorLineColor}
              strokeWidth="1"
            />
          </Pattern>
        </Defs>

        <Rect width="100%" height="100%" fill="url(#grid)" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  absoluteContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
}));

export default BlueprintGrid;
