import { ConfirmationPopup, ConfirmationPopupProps } from "@/ui/components";
import { PopupRef } from "@/ui/components/Popup";
import { createContext, ReactNode, useContext, useRef, useState } from "react";

type ConfirmationPopupOptions = Pick<
  ConfirmationPopupProps,
  "title" | "confirmationTitle" | "rejectionTitle"
>;

type ConfirmContextType = {
  confirm: (options?: ConfirmationPopupOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
  const popupRef = useRef<PopupRef>(null);
  const [popupProps, setPopupProps] = useState<null | ConfirmationPopupOptions>(
    null,
  );

  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = (
    options: ConfirmationPopupOptions = {},
  ): Promise<boolean> => {
    popupRef.current?.open();
    setPopupProps(options);

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  };

  const handleChoice = (choice: boolean) => {
    popupRef.current?.close();
    if (resolver.current) {
      resolver.current(choice);
      resolver.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmationPopup
        {...popupProps}
        ref={popupRef}
        onConfirm={() => handleChoice(true)}
        onReject={() => handleChoice(false)}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used inside of ConfirmationContext");
  }
  return context;
};
