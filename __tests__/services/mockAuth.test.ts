import {
  signUp,
  signIn,
  signOut,
  getUserProfile,
  updateUserProfile,
  onAuthStateChanged,
} from '../../src/services/mockAuthService';

describe('mockAuthService', () => {
  describe('signUp', () => {
    it('creates a new user and returns user data', async () => {
      const user = await signUp('test@example.com', 'password123', 'Test User');
      expect(user.uid).toBeTruthy();
      expect(user.email).toBe('test@example.com');
      expect(user.displayName).toBe('Test User');
      expect(user.nativeLanguage).toBe('en');
      expect(user.targetLanguage).toBe('es');
      expect(user.level).toBe('A1');
      expect(user.xp).toBe(0);
      expect(user.streak).toBe(0);
    });

    it('throws error for duplicate email', async () => {
      await signUp('dup@example.com', 'pass123', 'User 1');
      await expect(signUp('dup@example.com', 'pass456', 'User 2')).rejects.toThrow(
        'already exists'
      );
    });
  });

  describe('signIn', () => {
    it('signs in with demo account', async () => {
      const user = await signIn('demo@lango.app', 'demo123');
      expect(user).not.toBeNull();
      expect(user!.email).toBe('demo@lango.app');
      expect(user!.displayName).toBe('Demo User');
    });

    it('throws error for wrong password', async () => {
      await expect(signIn('demo@lango.app', 'wrong')).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('throws error for non-existent email', async () => {
      await expect(signIn('nobody@example.com', 'pass')).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });

  describe('getUserProfile', () => {
    it('returns profile for existing user', async () => {
      const profile = await getUserProfile('demo-user-001');
      expect(profile).not.toBeNull();
      expect(profile!.displayName).toBe('Demo User');
    });

    it('returns null for non-existent user', async () => {
      const profile = await getUserProfile('nonexistent');
      expect(profile).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('updates user fields', async () => {
      const user = await signUp('update@test.com', 'pass', 'Update Me');
      await updateUserProfile(user.uid, {
        nativeLanguage: 'sr',
        targetLanguage: 'it',
        level: 'B1',
      });
      const updated = await getUserProfile(user.uid);
      expect(updated!.nativeLanguage).toBe('sr');
      expect(updated!.targetLanguage).toBe('it');
      expect(updated!.level).toBe('B1');
    });
  });

  describe('signOut', () => {
    it('clears current user', async () => {
      await signIn('demo@lango.app', 'demo123');
      await signOut();
      // After sign out, onAuthStateChanged should emit null
      const result = await new Promise<any>((resolve) => {
        onAuthStateChanged((user) => resolve(user));
      });
      expect(result).toBeNull();
    });
  });
});
