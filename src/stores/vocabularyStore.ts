import { create } from 'zustand';
import type { VocabReviewCard, CourseId, ReviewQuality, VocabularyItem } from '../types';
import * as vocabService from '../services/vocabularyService';
import * as storage from '../services/storageService';
import { calculateNextReview, createNewCard, getDueCards, getMasteryStats } from '../utils/sm2';

interface VocabularyState {
  cards: VocabReviewCard[];
  isLoading: boolean;
  fetchCards: (uid: string, courseId: CourseId) => Promise<void>;
  addLessonVocab: (
    uid: string,
    courseId: CourseId,
    lessonId: string,
    items: VocabularyItem[]
  ) => Promise<void>;
  reviewCard: (
    uid: string,
    courseId: CourseId,
    cardId: string,
    quality: ReviewQuality
  ) => Promise<void>;
  getDueCards: () => VocabReviewCard[];
  getStats: () => { new: number; learning: number; reviewing: number; mastered: number; total: number };
  reset: () => void;
}

export const useVocabularyStore = create<VocabularyState>((set, get) => ({
  cards: [],
  isLoading: false,

  fetchCards: async (uid, courseId) => {
    set({ isLoading: true });
    // Try cached cards first
    const cached = await storage.loadVocabCards(courseId);
    if (cached && cached.length > 0) {
      set({ cards: cached, isLoading: false });
    }
    // Then fetch from service
    const cards = await vocabService.getCards(uid, courseId);
    if (cards.length > 0) {
      set({ cards, isLoading: false });
      storage.saveVocabCards(courseId, cards);
    } else if (!cached || cached.length === 0) {
      set({ isLoading: false });
    }
  },

  addLessonVocab: async (uid, courseId, lessonId, items) => {
    const existing = get().cards;
    const newCards: VocabReviewCard[] = [];

    for (const item of items) {
      if (existing.some((c) => c.id === item.id)) continue;
      const card = createNewCard(item.id, item.word, item.translation, item.pronunciation, courseId, lessonId);
      newCards.push(card);
    }

    if (newCards.length > 0) {
      await vocabService.saveCards(uid, courseId, newCards);
      const allCards = [...existing, ...newCards];
      set({ cards: allCards });
      storage.saveVocabCards(courseId, allCards);
    }
  },

  reviewCard: async (uid, courseId, cardId, quality) => {
    const cards = get().cards;
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const updates = calculateNextReview(card, quality);
    const updatedCard = { ...card, ...updates };
    await vocabService.saveCard(uid, courseId, updatedCard);

    const allCards = cards.map((c) => (c.id === cardId ? updatedCard : c));
    set({ cards: allCards });
    storage.saveVocabCards(courseId, allCards);
  },

  getDueCards: () => getDueCards(get().cards),
  getStats: () => getMasteryStats(get().cards),
  reset: () => set({ cards: [], isLoading: false }),
}));
