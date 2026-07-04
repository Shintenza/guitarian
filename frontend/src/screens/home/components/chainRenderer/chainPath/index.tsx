import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { ChainPathConfig, computeChainPath } from "./utils";

const MAX_LENGTH = 30000;

type ChainPathProps = Omit<ChainPathConfig, "cornerRadius"> & {
  cornerRadius?: number;
};

export default function ChainPath({
  startY,
  width,
  padding,
  cornerRadius = 24,
  chainLength,
  numberOfColumns,
  stepHeight,
}: ChainPathProps) {
  const { theme } = useUnistyles();
  const { pathData, totalLength } = useMemo(
    () =>
      computeChainPath({
        startY,
        width,
        padding,
        cornerRadius,
        stepHeight,
        chainLength,
        numberOfColumns,
      }),
    [
      chainLength,
      cornerRadius,
      numberOfColumns,
      padding,
      startY,
      stepHeight,
      width,
    ],
  );

  const animatedLength = useSharedValue(width - 2 * padding - cornerRadius);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: MAX_LENGTH - animatedLength.value,
    };
  });

  useEffect(() => {
    animatedLength.value = withTiming(totalLength, { duration: 1000 });
  }, [totalLength, animatedLength]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <AnimatedPath
          d={pathData}
          stroke={theme.colors.darkOrange}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={`${MAX_LENGTH} ${MAX_LENGTH}`}
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
