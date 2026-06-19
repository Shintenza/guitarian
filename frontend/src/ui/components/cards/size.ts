import { Responsive } from "@/ui/theme/types";
import { CardType } from "./types";

export const CARD_SIZES = {
  chainCard: {
    width: {
      sm: 100,
      md: 260,
    },
    height: {
      sm: 120,
      md: 260,
    },
  },
  libraryPluginCard: undefined,
} satisfies Record<
  CardType,
  { width: Responsive<number>; height: Responsive<number> } | undefined
>;
