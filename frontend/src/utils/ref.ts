import { Ref, useLayoutEffect, useRef } from "react";

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

export function useLatestRef<T>(value: T) {
  const ref = useRef<T>(value);

  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}
