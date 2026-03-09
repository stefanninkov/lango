import { create } from 'zustand';
import type { Achievement, DailyGoal } from '../types';
import { ACHIEVEMENTS, checkAchievements, getXPProgress } from '../utils/gamification';

interface GamificationState {
  unlockedAchievements: Achievement[];
  dailyGoal: DailyGoal;
  newAchievement: Achievement | null; // for showing unlock popup

  // Check and unlock achievements based on current stats
  refreshAchievements: (stats: {
    lessonsCompleted: number;
    streak: number;
    xp: number;
    wordsMastered: number;
    perfectQuizzes: number;
  }) => void;

  // Update daily goal progress
  incrementLessons: () => void;
  incrementReviews: (count: number) => void;
  resetDailyGoalIfNeeded: () => void;

  // Clear the "new achievement" popup
  dismissAchievement: () => void;

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

    // Find newly unlocked
    const newlyUnlocked = unlocked.filter((a) => !currentIds.has(a.id));
    const allUnlocked = unlocked.map((a) => ({
      ...a,
      unlockedAt: currentIds.has(a.id)
        ? current.find((c) => c.id === a.id)?.unlockedAt
        : Date.now(),
    }));

    set({
      unlockedAchievements: allUnlocked,
      // Show the most recent new achievement
      newAchievement: newlyUnlocked.length > 0 ? newlyUnlocked[newlyUnlocked.length - 1] : null,
    });
  },

  incrementLessons: () => {
    const goal = get().dailyGoal;
    set({ dailyGoal: { ...goal, lessonsCompleted: goal.lessonsCompleted + 1 } });
  },

  incrementReviews: (count) => {
    const goal = get().dailyGoal;
    set({ dailyGoal: { ...goal, reviewsCompleted: goal.reviewsCompleted + count } });
  },

  resetDailyGoalIfNeeded: () => {
    const goal = get().dailyGoal;
    if (goal.date !== todayStr()) {
      set({ dailyGoal: defaultDailyGoal() });
    }
  },

  dismissAchievement: () => set({ newAchievement: null }),

  reset: () => set({
    unlockedAchievements: [],
    dailyGoal: defaultDailyGoal(),
    newAchievement: null,
  }),
}));
