import type { User } from '../types';

// In-memory store
let currentUser: User | null = null;
const users: Record<string, User & { password: string }> = {};
let authListener: ((user: { uid: string } | null) => void) | null = null;

// Seed a demo account
const DEMO_UID = 'demo-user-001';
users[DEMO_UID] = {
  uid: DEMO_UID,
  email: 'demo@lango.app',
  displayName: 'Demo User',
  nativeLanguage: 'en',
  targetLanguage: 'es',
  level: 'A1',
  xp: 150,
  streak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  createdAt: Date.now(),
  password: 'demo123',
};

function notifyListener() {
  if (authListener) {
    authListener(currentUser ? { uid: currentUser.uid } : null);
  }
}

export function onAuthStateChanged(callback: (user: { uid: string } | null) => void) {
  authListener = callback;
  // Simulate async check
  setTimeout(() => callback(currentUser ? { uid: currentUser.uid } : null), 100);
  return () => {
    authListener = null;
  };
}

export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  // Check if email already exists
  const existing = Object.values(users).find((u) => u.email === email);
  if (existing) throw new Error('An account with this email already exists');

  const uid = `user-${Date.now()}`;
  const user: User = {
    uid,
    email,
    displayName,
    nativeLanguage: 'en',
    targetLanguage: 'es',
    level: 'A1',
    xp: 0,
    streak: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
    createdAt: Date.now(),
  };
  users[uid] = { ...user, password };
  currentUser = user;
  notifyListener();
  return user;
}

export async function signIn(email: string, password: string): Promise<User | null> {
  const found = Object.values(users).find(
    (u) => u.email === email && u.password === password
  );
  if (!found) throw new Error('Invalid email or password');
  const { password: _, ...user } = found;
  currentUser = user;
  notifyListener();
  return user;
}

export async function signOut() {
  currentUser = null;
  notifyListener();
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const found = users[uid];
  if (!found) return null;
  const { password: _, ...user } = found;
  return user;
}

export async function updateUserProfile(uid: string, data: Partial<User>) {
  if (users[uid]) {
    Object.assign(users[uid], data);
    if (currentUser?.uid === uid) {
      const { password: _, ...user } = users[uid];
      currentUser = user;
    }
  }
}

// Helper for progress service to read/write user data
export function _getMockUserData(uid: string) {
  return users[uid] ?? null;
}

export function _updateMockUserData(uid: string, data: Partial<User>) {
  if (users[uid]) {
    Object.assign(users[uid], data);
  }
}
