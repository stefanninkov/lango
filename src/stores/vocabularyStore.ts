import { create } from 'zustand';
import type { VocabReviewCard, CourseId, ReviewQuality, VocabularyItem } from '../types';
import * as vocabService from '../services/vocabularyService';
import { calculateNextReview, createNewCard, getDueCards, getMasteryStats } from '../utils/sm2';

interface VocabularyState {
  cards: VocabReviewCard[];
  isLoading: boolean;

  // Load all cards for a course
  fetchCards: (uid: string, courseId: CourseId) => Promise<void>;

  // Add vocabulary from a completed lesson
  addLessonVocab: (
    uid: string,
    courseId: CourseId,
    lessonId: string,
    items: VocabularyItem[]
  ) => Promise<void>;

  // Review a card with SM-2 quality rating
  reviewCard: (
    uid: string,
    courseId: CourseId,
    cardId: string,
    quality: ReviewQuality
  ) => Promise<void>;

  // Get cards due for review
  getDueCards: () => VocabReviewCard[];

  // Get mastery statistics
  getStats: () => { new: number; learning: number; reviewing: number; mastered: number; total: number };

  reset: () => void;
}

export const useVocabularyStore = create<VocabularyState>((set, get) => ({
  cards: [],
  isLoading: false,

  fetchCards: async (uid, courseId) => {
    set({ isLoading: true });
    const cards = await vocabService.getCards(uid, courseId);
    set({ cards, isLoading: false });
  },

  addLessonVocab: async (uid, courseId, lessonId, items) => {
    const existing = get().cards;
    const newCards: VocabReviewCard[] = [];

    for (const item of items) {
      // Skip if already added
      if (existing.some((c) => c.id === item.id)) continue;
      const card = createNewCard(item.id, item.word, item.translation, item.pronunciation, courseId, lessonId);
      newCards.push(card);
    }

    if (newCards.length > 0) {
      await vocabService.saveCards(uid, courseId, newCards);
      set({ cards: [...existing, ...newCards] });
    }
  },

  reviewCard: async (uid, courseId, cardId, quality) => {
    const cards = get().cards;
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const updates = calculateNextReview(card, quality);
    const updatedCard = { ...card, ...updates };
    await vocabService.saveCard(uid, courseId, updatedCard);

    set({
      cards: cards.map((c) => (c.id === cardId ? updatedCard : c)),
    });
  },

  getDueCards: () => {
    return getDueCards(get().cards);
  },

  getStats: () => {
    return getMasteryStats(get().cards);
  },

  reset: () => set({ cards: [], isLoading: false }),
}));
