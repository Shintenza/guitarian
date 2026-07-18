import { ReactNode } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

const KeyboardHandler = ({ children }: { children: ReactNode }) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {children}
    </TouchableWithoutFeedback>
  );
};

export default KeyboardHandler;
