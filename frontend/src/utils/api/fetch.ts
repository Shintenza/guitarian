import { connectionStore } from "@/stores/connection";
import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown>;
};

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const connection = connectionStore.getState().connection;

  if (!connection) {
    throw new Error("missing connection details");
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const baseUrl = `http://${connection.host}:${connection.port}`;
  const url = `${baseUrl}/${cleanEndpoint}`;

  const requestBody = options.body
    ? JSON.stringify(snakecaseKeys(options.body, { deep: true }))
    : undefined;

  const config: RequestInit = {
    ...options,
    body: requestBody,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    let errorData = null;
    try {
      errorData = errorText ? JSON.parse(errorText) : null;
    } catch {
      //empty
    }
    throw new Error(errorData?.message || `HTTP error: ${response.status}`);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  const text = await response.text();

  if (!text) {
    return null as unknown as T;
  }

  const responseJson = JSON.parse(text);
  return camelcaseKeys(responseJson, { deep: true }) as T;
}
