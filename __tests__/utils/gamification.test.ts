import {
  getLevel,
  getXPForLevel,
  getXPProgress,
  checkAchievements,
  getDailyGoalProgress,
  ACHIEVEMENTS,
} from '../../src/utils/gamification';

describe('Gamification', () => {
  describe('getLevel', () => {
    it('starts at level 1 with 0 XP', () => {
      expect(getLevel(0)).toBe(1);
    });

    it('reaches level 2 at 50 XP', () => {
      expect(getLevel(49)).toBe(1);
      expect(getLevel(50)).toBe(2);
    });

    it('reaches level 3 at 150 XP', () => {
      expect(getLevel(149)).toBe(2);
      expect(getLevel(150)).toBe(3);
    });

    it('increases levels progressively', () => {
      expect(getLevel(300)).toBe(4);
    });
  });

  describe('getXPForLevel', () => {
    it('level 1 requires 0 XP', () => {
      expect(getXPForLevel(1)).toBe(0);
    });

    it('level 2 requires 50 XP', () => {
      expect(getXPForLevel(2)).toBe(50);
    });

    it('level 3 requires 150 XP', () => {
      expect(getXPForLevel(3)).toBe(150);
    });
  });

  describe('getXPProgress', () => {
    it('returns correct progress for level 1', () => {
      const prog = getXPProgress(25);
      expect(prog.level).toBe(1);
      expect(prog.current).toBe(25);
      expect(prog.needed).toBe(50);
      expect(prog.percent).toBe(0.5);
    });

    it('returns 0 progress at level start', () => {
      const prog = getXPProgress(50);
      expect(prog.level).toBe(2);
      expect(prog.current).toBe(0);
    });
  });

  describe('checkAchievements', () => {
    it('returns empty array for new user', () => {
      const result = checkAchievements({
        lessonsCompleted: 0,
        streak: 0,
        xp: 0,
        wordsMastered: 0,
        perfectQuizzes: 0,
      });
      expect(result).toHaveLength(0);
    });

    it('unlocks first-lesson achievement', () => {
      const result = checkAchievements({
        lessonsCompleted: 1,
        streak: 0,
        xp: 0,
        wordsMastered: 0,
        perfectQuizzes: 0,
      });
      expect(result.some((a) => a.id === 'first-lesson')).toBe(true);
    });

    it('unlocks streak achievements', () => {
      const result = checkAchievements({
        lessonsCompleted: 0,
        streak: 7,
        xp: 0,
        wordsMastered: 0,
        perfectQuizzes: 0,
      });
      expect(result.some((a) => a.id === 'streak-3')).toBe(true);
      expect(result.some((a) => a.id === 'streak-7')).toBe(true);
      expect(result.some((a) => a.id === 'streak-30')).toBe(false);
    });

    it('unlocks XP achievements', () => {
      const result = checkAchievements({
        lessonsCompleted: 0,
        streak: 0,
        xp: 500,
        wordsMastered: 0,
        perfectQuizzes: 0,
      });
      expect(result.some((a) => a.id === 'xp-100')).toBe(true);
      expect(result.some((a) => a.id === 'xp-500')).toBe(true);
    });

    it('unlocks multiple achievement types simultaneously', () => {
      const result = checkAchievements({
        lessonsCompleted: 10,
        streak: 30,
        xp: 500,
        wordsMastered: 10,
        perfectQuizzes: 5,
      });
      expect(result.length).toBe(ACHIEVEMENTS.length); // All unlocked
    });
  });

  describe('getDailyGoalProgress', () => {
    it('returns 0 when no progress', () => {
      expect(getDailyGoalProgress(0, 0, 2, 10)).toBe(0);
    });

    it('returns 0.75 when lessons half done and reviews target is 0', () => {
      // lessons: 1/2 = 0.5, reviews: 0/0 = 1.0 (no target means complete), avg = 0.75
      expect(getDailyGoalProgress(1, 0, 2, 0)).toBe(0.75);
    });

    it('returns 0.5 when both halves are half done', () => {
      expect(getDailyGoalProgress(1, 5, 2, 10)).toBe(0.5);
    });

    it('returns 1 when all goals met', () => {
      expect(getDailyGoalProgress(2, 10, 2, 10)).toBe(1);
    });

    it('caps at 1 when exceeding goals', () => {
      expect(getDailyGoalProgress(5, 20, 2, 10)).toBe(1);
    });

    it('returns 1 when targets are 0', () => {
      expect(getDailyGoalProgress(0, 0, 0, 0)).toBe(1);
    });
  });
});
