import { USE_MOCK } from '../config/env';
import * as real from './firebaseProgressService';
import * as mock from './mockProgressService';

const impl = USE_MOCK ? mock : real;

export const getProgress = impl.getProgress;
export const completeLesson = impl.completeLesson;
export const addXP = impl.addXP;
export const updateStreak = impl.updateStreak;
