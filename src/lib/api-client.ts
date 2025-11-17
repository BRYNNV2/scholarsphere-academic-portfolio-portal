import { ApiResponse } from "../../shared/types"
import { useAuthStore } from "@/stores/auth-store";

const hydrationPromise = new Promise<void>(resolve => {
  if (useAuthStore.persist.hasHydrated()) {
    resolve();
  } else {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      resolve();
      unsub();
    });
  }
});

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  await hydrationPromise;
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

api.post = async function <T>(path: string, body: unknown): Promise<T> {
  return api(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};