import { create } from 'zustand';
import type { AuthUser } from '@/lib/auth/types';

type AuthState = {
  user: AuthUser | null;
  hasHydrated: boolean;
  sessionError: boolean;
  setSessionError: (value: boolean) => void;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  setHydrated: () => void;
};

export const useAuth = create<AuthState>(set => ({
  user: null,
  hasHydrated: false,
  sessionError: false,
  setSessionError: sessionError => set({ sessionError }),
  setUser: user => set({ user, sessionError: false }),
  clearUser: () => set({ user: null }),
  setHydrated: () => set({ hasHydrated: true }),
}));
