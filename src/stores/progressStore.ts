import { create } from 'zustand';
import type { UserProgress, CourseId } from '../types';
import * as progressService from '../services/progressService';
import * as storage from '../services/storageService';

interface ProgressState {
  progress: UserProgress | null;
  isLoading: boolean;
  fetchProgress: (uid: string, courseId: CourseId) => Promise<void>;
  markLessonComplete: (
    uid: string,
    courseId: CourseId,
    lessonId: string,
    quizScore: number
  ) => Promise<void>;
  isLessonCompleted: (lessonId: string) => boolean;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: null,
  isLoading: false,

  fetchProgress: async (uid, courseId) => {
    set({ isLoading: true });
    // Try loading from AsyncStorage first
    const cached = await storage.loadProgress(courseId);
    if (cached) {
      set({ progress: cached, isLoading: false });
    }
    // Then fetch from service (mock or real)
    const progress = await progressService.getProgress(uid, courseId);
    set({ progress, isLoading: false });
    storage.saveProgress(courseId, progress);
  },

  markLessonComplete: async (uid, courseId, lessonId, quizScore) => {
    await progressService.completeLesson(uid, courseId, lessonId, quizScore);
    const current = get().progress;
    if (current) {
      const updated = {
        ...current,
        completedLessons: [...current.completedLessons, lessonId],
        quizScores: { ...current.quizScores, [lessonId]: quizScore },
      };
      set({ progress: updated });
      storage.saveProgress(courseId, updated);
    }
  },

  isLessonCompleted: (lessonId) => {
    return get().progress?.completedLessons.includes(lessonId) ?? false;
  },

  reset: () => set({ progress: null, isLoading: false }),
}));
