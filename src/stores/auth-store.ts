import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LecturerProfile } from '@shared/types';
interface AuthState {
  user: LecturerProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: LecturerProfile, token: string) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);