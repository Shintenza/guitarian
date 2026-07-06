import { apiFetch } from "@/utils/api/fetch";
import { ConnectPortsRequest } from "./types";

export const connectPorts = async (data: ConnectPortsRequest) => {
  await apiFetch("/ports/connect", { method: "POST", body: data });
};
