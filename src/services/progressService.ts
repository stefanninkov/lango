import { USE_MOCK } from '../config/env';

const services = USE_MOCK
  ? require('./mockProgressService')
  : require('./firebaseProgressService');

export const getProgress: typeof import('./firebaseProgressService').getProgress = services.getProgress;
export const completeLesson: typeof import('./firebaseProgressService').completeLesson = services.completeLesson;
export const addXP: typeof import('./firebaseProgressService').addXP = services.addXP;
export const updateStreak: typeof import('./firebaseProgressService').updateStreak = services.updateStreak;
