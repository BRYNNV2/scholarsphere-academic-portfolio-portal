import { ApiResponse } from "../../shared/types";
import { useAuthStore } from "@/stores/auth-store";
// This promise ensures that the Zustand store is hydrated from localStorage before any API calls are made.
// This is crucial for ensuring the auth token is available on initial page load.
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
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  await hydrationPromise;
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(path, { ...options, headers });
  if (res.status === 204) { // No Content
    return undefined as T;
  }
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}
export const api = {
  get: <T>(path: string): Promise<T> => {
    return request<T>(path, { method: 'GET' });
  },
  post: <T>(path: string, body?: unknown): Promise<T> => {
    return request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : null,
    });
  },
  put: <T>(path: string, body?: unknown): Promise<T> => {
    return request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : null,
    });
  },
  delete: <T>(path: string): Promise<T> => {
    return request<T>(path, { method: 'DELETE' });
  },
};
// Per client request, the `get` method is also the default export for convenience.
export default api.get;