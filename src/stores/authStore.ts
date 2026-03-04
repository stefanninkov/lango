import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isOnboarded: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isOnboarded: !!(user?.nativeLanguage && user?.targetLanguage),
    }),
  setLoading: (isLoading) => set({ isLoading }),
  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
    }),
}));
