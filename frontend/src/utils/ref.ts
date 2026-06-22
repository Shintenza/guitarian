import { Ref } from "react";

type PossibleRef<T> = Ref<T> | undefined;

export function mergeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}
