import { configStore } from "@/stores/config";
import camelcaseKeys from "camelcase-keys";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const connection = configStore.getState().connection;

  if (!connection) {
    throw new Error("missing connection details");
  }
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

  const baseUrl = `http://${connection.host}:${connection.port}`;
  const url = `${baseUrl}/${cleanEndpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP error: ${response.status}`);
  }

  const responseJson = await response.json();

  return camelcaseKeys(responseJson, { deep: true }) as Promise<T>;
}
