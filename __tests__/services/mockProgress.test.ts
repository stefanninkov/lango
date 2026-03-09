import {
  getProgress,
  completeLesson,
  addXP,
  updateStreak,
} from '../../src/services/mockProgressService';
import { signUp, getUserProfile } from '../../src/services/mockAuthService';

describe('mockProgressService', () => {
  let testUid: string;

  beforeAll(async () => {
    const user = await signUp('progress-test@test.com', 'pass', 'Progress Test');
    testUid = user.uid;
  });

  describe('getProgress', () => {
    it('returns initial progress for new course', async () => {
      const progress = await getProgress(testUid, 'en-es');
      expect(progress).not.toBeNull();
      expect(progress!.courseId).toBe('en-es');
      expect(progress!.completedLessons).toEqual([]);
      expect(progress!.quizScores).toEqual({});
      expect(progress!.currentUnit).toBe('unit-1');
      expect(progress!.currentLesson).toBe('lesson-1');
    });
  });

  describe('completeLesson', () => {
    it('adds lesson to completed list with score', async () => {
      await completeLesson(testUid, 'en-es', 'lesson-1', 80);
      const progress = await getProgress(testUid, 'en-es');
      expect(progress!.completedLessons).toContain('lesson-1');
      expect(progress!.quizScores['lesson-1']).toBe(80);
    });

    it('does not duplicate completed lessons', async () => {
      await completeLesson(testUid, 'en-es', 'lesson-1', 90);
      const progress = await getProgress(testUid, 'en-es');
      const count = progress!.completedLessons.filter(
        (l) => l === 'lesson-1'
      ).length;
      expect(count).toBe(1);
      // Score should be updated
      expect(progress!.quizScores['lesson-1']).toBe(90);
    });

    it('tracks multiple lessons', async () => {
      await completeLesson(testUid, 'en-es', 'lesson-2', 100);
      const progress = await getProgress(testUid, 'en-es');
      expect(progress!.completedLessons).toContain('lesson-1');
      expect(progress!.completedLessons).toContain('lesson-2');
    });
  });

  describe('addXP', () => {
    it('increments user XP', async () => {
      const before = await getUserProfile(testUid);
      const xpBefore = before!.xp;
      await addXP(testUid, 20);
      const after = await getUserProfile(testUid);
      expect(after!.xp).toBe(xpBefore + 20);
    });
  });

  describe('updateStreak', () => {
    it('does not increment streak if already active today', async () => {
      // User was created today, so lastActiveDate is already today
      const before = await getUserProfile(testUid);
      const streakBefore = before!.streak;
      await updateStreak(testUid);
      const after = await getUserProfile(testUid);
      expect(after!.streak).toBe(streakBefore); // No change
    });

    it('increments streak when last active was yesterday', async () => {
      // Simulate yesterday's activity by modifying lastActiveDate
      const { _updateMockUserData } = require('../../src/services/mockAuthService');
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      _updateMockUserData(testUid, { lastActiveDate: yesterday, streak: 2 });

      await updateStreak(testUid);
      const user = await getUserProfile(testUid);
      expect(user!.streak).toBe(3);
      expect(user!.lastActiveDate).toBe(new Date().toISOString().split('T')[0]);
    });

    it('resets streak when gap is more than one day', async () => {
      const { _updateMockUserData } = require('../../src/services/mockAuthService');
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
      _updateMockUserData(testUid, { lastActiveDate: twoDaysAgo, streak: 10 });

      await updateStreak(testUid);
      const user = await getUserProfile(testUid);
      expect(user!.streak).toBe(1); // Reset
    });
  });
});
