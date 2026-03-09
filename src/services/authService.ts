import { USE_MOCK } from '../config/env';
import * as real from './firebaseAuthService';
import * as mock from './mockAuthService';

const impl = USE_MOCK ? mock : real;

export const onAuthStateChanged = impl.onAuthStateChanged;
export const signUp = impl.signUp;
export const signIn = impl.signIn;
export const signOut = impl.signOut;
export const getUserProfile = impl.getUserProfile;
export const updateUserProfile = impl.updateUserProfile;
