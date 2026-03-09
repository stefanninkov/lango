import type { UserProgress, CourseId } from '../types';
import { _getMockUserData, _updateMockUserData } from './mockAuthService';

// In-memory progress store: uid -> courseId -> progress
const progressStore: Record<string, Record<string, UserProgress>> = {};

export async function getProgress(
  uid: string,
  courseId: CourseId
): Promise<UserProgress | null> {
  if (!progressStore[uid]) progressStore[uid] = {};
  if (!progressStore[uid][courseId]) {
    progressStore[uid][courseId] = {
      courseId,
      completedLessons: [],
      quizScores: {},
      currentUnit: 'unit-1',
      currentLesson: 'lesson-1',
    };
  }
  return progressStore[uid][courseId];
}

export async function completeLesson(
  uid: string,
  courseId: CourseId,
  lessonId: string,
  quizScore: number
) {
  if (!progressStore[uid]) progressStore[uid] = {};
  if (!progressStore[uid][courseId]) {
    await getProgress(uid, courseId);
  }
  const progress = progressStore[uid][courseId];
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
  }
  progress.quizScores[lessonId] = quizScore;
}

export async function addXP(uid: string, amount: number) {
  const userData = _getMockUserData(uid);
  if (userData) {
    _updateMockUserData(uid, { xp: (userData.xp ?? 0) + amount });
  }
}

export async function updateStreak(uid: string) {
  const userData = _getMockUserData(uid);
  if (!userData) return;

  const today = new Date().toISOString().split('T')[0];
  if (userData.lastActiveDate === today) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const newStreak = userData.lastActiveDate === yesterday ? (userData.streak ?? 0) + 1 : 1;

  _updateMockUserData(uid, { streak: newStreak, lastActiveDate: today });
}
