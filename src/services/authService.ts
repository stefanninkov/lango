import { USE_MOCK } from '../config/env';

const services = USE_MOCK
  ? require('./mockAuthService')
  : require('./firebaseAuthService');

export const onAuthStateChanged: typeof import('./firebaseAuthService').onAuthStateChanged = services.onAuthStateChanged;
export const signUp: typeof import('./firebaseAuthService').signUp = services.signUp;
export const signIn: typeof import('./firebaseAuthService').signIn = services.signIn;
export const signOut: typeof import('./firebaseAuthService').signOut = services.signOut;
export const getUserProfile: typeof import('./firebaseAuthService').getUserProfile = services.getUserProfile;
export const updateUserProfile: typeof import('./firebaseAuthService').updateUserProfile = services.updateUserProfile;
