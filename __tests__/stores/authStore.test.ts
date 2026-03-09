import { useAuthStore } from '../../src/stores/authStore';
import type { User } from '../../src/types';

const mockUser: User = {
  uid: 'test-123',
  email: 'test@test.com',
  displayName: 'Test User',
  nativeLanguage: 'en',
  targetLanguage: 'es',
  level: 'beginner',
  xp: 100,
  streak: 5,
  lastActiveDate: '2025-01-15',
  createdAt: Date.now(),
};

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearUser();
  });

  it('starts with no user and loading state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isOnboarded).toBe(false);
  });

  it('setUser updates authentication state', () => {
    useAuthStore.getState().setUser(mockUser);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isOnboarded).toBe(true);
  });

  it('setUser with null clears authentication', () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setUser(null);
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('isOnboarded is false when language not set', () => {
    const incompleteUser = {
      ...mockUser,
      nativeLanguage: '' as any,
      targetLanguage: '' as any,
    };
    useAuthStore.getState().setUser(incompleteUser);
    expect(useAuthStore.getState().isOnboarded).toBe(false);
  });

  it('clearUser resets all state', () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().clearUser();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isOnboarded).toBe(false);
  });

  it('setLoading updates loading state', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
