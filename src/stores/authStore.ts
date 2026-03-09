import { create } from 'zustand';
import type { User } from '../types';
import * as storage from '../services/storageService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
  hydrateFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isOnboarded: false,
  setUser: (user) => {
    if (user) storage.saveUser(user);
    set({
      user,
      isAuthenticated: !!user,
      isOnboarded: !!(user?.nativeLanguage && user?.targetLanguage),
    });
  },
  setLoading: (isLoading) => set({ isLoading }),
  clearUser: () => {
    storage.clearUser();
    set({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
    });
  },
  hydrateFromStorage: async () => {
    const user = await storage.loadUser();
    if (user) {
      set({
        user,
        isAuthenticated: true,
        isOnboarded: !!(user.nativeLanguage && user.targetLanguage),
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },
}));
