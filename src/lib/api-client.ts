import { ApiResponse } from "../../shared/types"
import { useAuthStore, hasHydrated } from "@/stores/auth-store";
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  await hasHydrated;
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