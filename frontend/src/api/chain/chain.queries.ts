import { ChainPlugin } from "@/types/plugins";
import { apiFetch } from "@/utils/api/fetch";
import { GetCurrentChainResponse } from "./types";

export const getCurrentChain = async (): Promise<ChainPlugin[]> => {
  const response = await apiFetch<GetCurrentChainResponse>("/chain");
  const chain = response.chain.map((item) => ({ ...item, id: `${item.id}` }));
  return chain;
};
