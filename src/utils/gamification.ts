import type { Achievement, AchievementCondition } from '../types';

// XP Level System — each level requires progressively more XP
export function getLevel(xp: number): number {
  // Level 1: 0 XP, Level 2: 50 XP, Level 3: 150 XP, etc.
  // Formula: level N requires N*(N-1)*25 total XP
  let level = 1;
  let threshold = 0;
  while (threshold + level * 50 <= xp) {
    threshold += level * 50;
    level++;
  }
  return level;
}

export function getXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += i * 50;
  }
  return total;
}

export function getXPProgress(xp: number): { level: number; current: number; needed: number; percent: number } {
  const level = getLevel(xp);
  const levelStart = getXPForLevel(level);
  const levelEnd = getXPForLevel(level + 1);
  const current = xp - levelStart;
  const needed = levelEnd - levelStart;
  return { level, current, needed, percent: Math.min(current / needed, 1) };
}

// Achievement Definitions
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'shoe-print',
    condition: { type: 'lessons_completed', count: 1 },
  },
  {
    id: 'five-lessons',
    title: 'Getting Started',
    description: 'Complete 5 lessons',
    icon: 'star-outline',
    condition: { type: 'lessons_completed', count: 5 },
  },
  {
    id: 'ten-lessons',
    title: 'Dedicated Learner',
    description: 'Complete 10 lessons',
    icon: 'star',
    condition: { type: 'lessons_completed', count: 10 },
  },
  {
    id: 'streak-3',
    title: 'On Fire',
    description: 'Maintain a 3-day streak',
    icon: 'fire',
    condition: { type: 'streak_days', count: 3 },
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'calendar-check',
    condition: { type: 'streak_days', count: 7 },
  },
  {
    id: 'streak-30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: 'trophy',
    condition: { type: 'streak_days', count: 30 },
  },
  {
    id: 'xp-100',
    title: 'XP Hunter',
    description: 'Earn 100 XP',
    icon: 'lightning-bolt',
    condition: { type: 'xp_earned', amount: 100 },
  },
  {
    id: 'xp-500',
    title: 'XP Master',
    description: 'Earn 500 XP',
    icon: 'lightning-bolt-circle',
    condition: { type: 'xp_earned', amount: 500 },
  },
  {
    id: 'words-10',
    title: 'Word Collector',
    description: 'Master 10 vocabulary words',
    icon: 'book-open-variant',
    condition: { type: 'words_mastered', count: 10 },
  },
  {
    id: 'perfect-quiz',
    title: 'Perfectionist',
    description: 'Get a perfect score on a quiz',
    icon: 'check-decagram',
    condition: { type: 'quiz_perfect', count: 1 },
  },
  {
    id: 'perfect-quiz-5',
    title: 'Quiz Master',
    description: 'Get 5 perfect quiz scores',
    icon: 'medal',
    condition: { type: 'quiz_perfect', count: 5 },
  },
];

// Check which achievements are unlocked based on user stats
export function checkAchievements(stats: {
  lessonsCompleted: number;
  streak: number;
  xp: number;
  wordsMastered: number;
  perfectQuizzes: number;
}): Achievement[] {
  return ACHIEVEMENTS.filter((a) => {
    const c = a.condition;
    switch (c.type) {
      case 'lessons_completed':
        return stats.lessonsCompleted >= c.count;
      case 'streak_days':
        return stats.streak >= c.count;
      case 'xp_earned':
        return stats.xp >= c.amount;
      case 'words_mastered':
        return stats.wordsMastered >= c.count;
      case 'quiz_perfect':
        return stats.perfectQuizzes >= c.count;
      default:
        return false;
    }
  });
}

// Daily goal helpers
export function getDailyGoalProgress(
  lessonsCompleted: number,
  reviewsCompleted: number,
  lessonsTarget: number,
  reviewsTarget: number
): number {
  if (lessonsTarget + reviewsTarget === 0) return 1;
  const lessonPart = lessonsTarget > 0 ? Math.min(lessonsCompleted / lessonsTarget, 1) : 1;
  const reviewPart = reviewsTarget > 0 ? Math.min(reviewsCompleted / reviewsTarget, 1) : 1;
  return (lessonPart + reviewPart) / 2;
}
