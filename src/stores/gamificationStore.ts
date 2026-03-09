import { create } from 'zustand';
import type { Achievement, DailyGoal } from '../types';
import { ACHIEVEMENTS, checkAchievements } from '../utils/gamification';
import * as storage from '../services/storageService';

interface GamificationState {
  unlockedAchievements: Achievement[];
  dailyGoal: DailyGoal;
  newAchievement: Achievement | null;

  refreshAchievements: (stats: {
    lessonsCompleted: number;
    streak: number;
    xp: number;
    wordsMastered: number;
    perfectQuizzes: number;
  }) => void;

  incrementLessons: () => void;
  incrementReviews: (count: number) => void;
  resetDailyGoalIfNeeded: () => void;
  dismissAchievement: () => void;
  hydrateFromStorage: () => Promise<void>;
  reset: () => void;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function defaultDailyGoal(): DailyGoal {
  return {
    lessonsTarget: 2,
    reviewsTarget: 10,
    lessonsCompleted: 0,
    reviewsCompleted: 0,
    date: todayStr(),
  };
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  unlockedAchievements: [],
  dailyGoal: defaultDailyGoal(),
  newAchievement: null,

  refreshAchievements: (stats) => {
    const current = get().unlockedAchievements;
    const currentIds = new Set(current.map((a) => a.id));
    const unlocked = checkAchievements(stats);

    const newlyUnlocked = unlocked.filter((a) => !currentIds.has(a.id));
    const allUnlocked = unlocked.map((a) => ({
      ...a,
      unlockedAt: currentIds.has(a.id)
        ? current.find((c) => c.id === a.id)?.unlockedAt
        : Date.now(),
    }));

    set({
      unlockedAchievements: allUnlocked,
      newAchievement: newlyUnlocked.length > 0 ? newlyUnlocked[newlyUnlocked.length - 1] : null,
    });
    storage.saveAchievements(allUnlocked);
  },

  incrementLessons: () => {
    const goal = get().dailyGoal;
    const updated = { ...goal, lessonsCompleted: goal.lessonsCompleted + 1 };
    set({ dailyGoal: updated });
    storage.saveDailyGoal(updated);
  },

  incrementReviews: (count) => {
    const goal = get().dailyGoal;
    const updated = { ...goal, reviewsCompleted: goal.reviewsCompleted + count };
    set({ dailyGoal: updated });
    storage.saveDailyGoal(updated);
  },

  resetDailyGoalIfNeeded: () => {
    const goal = get().dailyGoal;
    if (goal.date !== todayStr()) {
      const fresh = defaultDailyGoal();
      set({ dailyGoal: fresh });
      storage.saveDailyGoal(fresh);
    }
  },

  dismissAchievement: () => set({ newAchievement: null }),

  hydrateFromStorage: async () => {
    const [achievements, dailyGoal] = await Promise.all([
      storage.loadAchievements(),
      storage.loadDailyGoal(),
    ]);
    if (achievements) set({ unlockedAchievements: achievements });
    if (dailyGoal) {
      // Reset if stale
      if (dailyGoal.date !== todayStr()) {
        set({ dailyGoal: defaultDailyGoal() });
      } else {
        set({ dailyGoal });
      }
    }
  },

  reset: () => set({
    unlockedAchievements: [],
    dailyGoal: defaultDailyGoal(),
    newAchievement: null,
  }),
}));
