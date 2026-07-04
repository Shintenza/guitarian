import React, { useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type HiddenContentProps = {
  children: React.ReactNode;
  header: (props: { opened: boolean; toggle: () => void }) => React.ReactNode;
};

const HiddenContent = ({ children, header }: HiddenContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentHeight = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(isExpanded ? contentHeight.value : 0),
  }));

  return (
    <View style={[styles.container]}>
      {header({
        opened: isExpanded,
        toggle: () => setIsExpanded((prev) => !prev),
      })}

      <Animated.View style={[animatedStyle, { overflow: "hidden" }]}>
        <View
          style={{ position: "absolute", width: "100%" }}
          onLayout={(e) => {
            contentHeight.value = e.nativeEvent.layout.height;
          }}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
});

export default HiddenContent;
