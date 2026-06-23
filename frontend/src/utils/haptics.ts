import * as Haptics from "expo-haptics";

export function withHaptics<T extends (...args: any[]) => any>(
  callback?: T,
  feedbackStyle: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle
    .Light,
) {
  return (...args: Parameters<T>) => {
    Haptics.impactAsync(feedbackStyle);
    if (callback) {
      return callback(...args);
    }
  };
}
