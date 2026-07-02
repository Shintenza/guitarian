import { ChainPlugin } from "@/types/plugins";

export const chainWithStringId = (chain: ChainPlugin[]): ChainPlugin[] => {
  return chain.map((item) => ({ ...item, id: `${item.id}` }));
};
