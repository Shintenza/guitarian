import { apiFetch } from "@/utils/api/fetch";
import {
  GetAvailableConnectionsResponse,
  GetCurrentConnectionsResponse,
} from "./types";

export const getCurrentConnections = async () => {
  const connections = apiFetch<GetCurrentConnectionsResponse>("/ports/state");
  return connections;
};

export const getAvailableConnections = async () => {
  const availableConnections =
    await apiFetch<GetAvailableConnectionsResponse>("/ports");
  return availableConnections;
};
