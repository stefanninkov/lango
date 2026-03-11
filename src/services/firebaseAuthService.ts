import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User } from '../types';

export function onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return firebaseOnAuthStateChanged(auth, callback);
}

export async function signUp(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const userData: Omit<User, 'uid'> = {
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
  await setDoc(doc(db, 'users', credential.user.uid), userData);
  return { ...userData, uid: credential.user.uid };
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return getUserProfile(credential.user.uid);
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as User;
}

export async function updateUserProfile(uid: string, data: Partial<User>) {
  await updateDoc(doc(db, 'users', uid), data);
}
