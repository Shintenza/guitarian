import { apiFetch } from "@/utils/api/fetch";
import { GetAllPluginsResponse, GetAllPluginsSearchParams } from "./types";

export const getAllPlugins = async ({
  class: types,
  name,
}: GetAllPluginsSearchParams = {}) => {
  const searchParams = new URLSearchParams();

  if (name) {
    searchParams.set("name", name);
  }

  for (const type of types ?? []) {
    searchParams.append("class", type);
  }

  const shouldUseParams = searchParams.size > 0;

  const data = await apiFetch<GetAllPluginsResponse>(
    `/plugins${shouldUseParams ? "?" + searchParams.toString() : ""}`,
    {
      method: "GET",
    },
  );
  return data.plugins;
};
