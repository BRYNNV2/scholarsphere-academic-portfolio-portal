import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile } from '@shared/types';
interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
}
let resolveHydration: (value: boolean) => void;
const hydratedPromise = new Promise<boolean>((resolve) => {
  resolveHydration = resolve;
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    {
      name: 'auth-storage', // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export const hasHydrated = hydratedPromise;

// Manually check for hydration completion
useAuthStore.subscribe(
  (state) => {
    if (!useAuthStore.persist.hasHydrated()) {
      return;
    }
    resolveHydration(true);
  }
);