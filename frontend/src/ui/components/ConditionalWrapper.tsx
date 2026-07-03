import { ComponentProps, ElementType, ReactNode } from "react";

type ConditionalWrapperProps<T extends ElementType> = {
  enabled?: boolean;
  wrapper: T;
  wrapperProps?: ComponentProps<T>;
  children: ReactNode;
};

const ConditionalWrapper = <T extends ElementType>({
  enabled = true,
  wrapper,
  wrapperProps,
  children,
}: ConditionalWrapperProps<T>) => {
  if (enabled) {
    const WrapperComponent = wrapper as ElementType;
    return (
      <WrapperComponent {...(wrapperProps as any)}>{children}</WrapperComponent>
    );
  }

  return <>{children}</>;
};

export default ConditionalWrapper;
