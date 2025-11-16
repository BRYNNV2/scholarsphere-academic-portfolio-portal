import { ApiResponse } from "../../shared/types"
import { useAuthStore } from "@/stores/auth-store";
/**
 * A fixed API client that safely retrieves the auth token from the Zustand store
 * using `getState()`, making it usable outside of React components.
 * @param path The API endpoint path.
 * @param init Optional request initialization options.
 * @returns A promise that resolves with the API response data.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // Correctly retrieve token from Zustand store outside of a React component
  const token = useAuthStore.getState().token;
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(path, { ...init, headers });
  if (res.status === 204) { // No Content
    return undefined as T;
  }
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}