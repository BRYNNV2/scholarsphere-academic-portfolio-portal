import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LecturerProfile } from '@shared/types';
interface AuthState {
  user: LecturerProfile | null;
  isAuthenticated: boolean;
  login: (user: LecturerProfile) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);