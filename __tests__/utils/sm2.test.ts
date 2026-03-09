import {
  calculateNextReview,
  createNewCard,
  isDueForReview,
  getDueCards,
  getMasteryStats,
} from '../../src/utils/sm2';
import type { VocabReviewCard } from '../../src/types';

function makeCard(overrides: Partial<VocabReviewCard> = {}): VocabReviewCard {
  return {
    id: 'test-card',
    word: 'hola',
    translation: 'hello',
    pronunciation: 'OH-lah',
    courseId: 'en-es' as any,
    lessonId: 'lesson-1',
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: Date.now(),
    mastery: 'new',
    lastReviewed: 0,
    ...overrides,
  };
}

describe('SM-2 Algorithm', () => {
  describe('calculateNextReview', () => {
    it('resets repetitions on quality < 3', () => {
      const card = makeCard({ repetitions: 5, interval: 30 });
      const result = calculateNextReview(card, 2);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it('sets interval to 1 on first successful recall', () => {
      const card = makeCard({ repetitions: 0 });
      const result = calculateNextReview(card, 4);
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
    });

    it('sets interval to 6 on second successful recall', () => {
      const card = makeCard({ repetitions: 1, interval: 1 });
      const result = calculateNextReview(card, 4);
      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
    });

    it('multiplies interval by easeFactor on 3rd+ recall', () => {
      const card = makeCard({ repetitions: 2, interval: 6, easeFactor: 2.5 });
      const result = calculateNextReview(card, 4);
      expect(result.repetitions).toBe(3);
      expect(result.interval).toBe(15); // round(6 * 2.5)
    });

    it('adjusts easeFactor based on quality', () => {
      const card = makeCard({ easeFactor: 2.5 });
      // Perfect recall (5) should increase ease
      const perfect = calculateNextReview(card, 5);
      expect(perfect.easeFactor).toBeGreaterThan(2.5);
      // Minimum recall (3) should decrease ease
      const hard = calculateNextReview(card, 3);
      expect(hard.easeFactor).toBeLessThan(2.5);
    });

    it('never lets easeFactor drop below 1.3', () => {
      const card = makeCard({ easeFactor: 1.3 });
      const result = calculateNextReview(card, 0);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('calculates mastery correctly', () => {
      const newCard = calculateNextReview(makeCard({ repetitions: 0 }), 0);
      expect(newCard.mastery).toBe('new');

      const learning = calculateNextReview(makeCard({ repetitions: 0 }), 4);
      expect(learning.mastery).toBe('learning');

      const reviewing = calculateNextReview(makeCard({ repetitions: 2, interval: 6 }), 4);
      expect(reviewing.mastery).toBe('reviewing');

      const mastered = calculateNextReview(
        makeCard({ repetitions: 5, interval: 15, easeFactor: 2.0 }),
        5
      );
      expect(mastered.mastery).toBe('mastered');
    });

    it('sets nextReview in the future', () => {
      const before = Date.now();
      const result = calculateNextReview(makeCard(), 4);
      expect(result.nextReview).toBeGreaterThan(before);
    });

    it('sets lastReviewed to now', () => {
      const before = Date.now();
      const result = calculateNextReview(makeCard(), 3);
      expect(result.lastReviewed).toBeGreaterThanOrEqual(before);
      expect(result.lastReviewed).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('createNewCard', () => {
    it('creates card with default SM-2 values', () => {
      const card = createNewCard('v1', 'hola', 'hello', 'OH-lah', 'en-es', 'lesson-1');
      expect(card.id).toBe('v1');
      expect(card.word).toBe('hola');
      expect(card.easeFactor).toBe(2.5);
      expect(card.interval).toBe(0);
      expect(card.repetitions).toBe(0);
      expect(card.mastery).toBe('new');
    });

    it('makes card immediately available for review', () => {
      const card = createNewCard('v1', 'hola', 'hello', 'OH-lah', 'en-es', 'lesson-1');
      expect(card.nextReview).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('isDueForReview', () => {
    it('returns true when nextReview is in the past', () => {
      const card = makeCard({ nextReview: Date.now() - 1000 });
      expect(isDueForReview(card)).toBe(true);
    });

    it('returns false when nextReview is in the future', () => {
      const card = makeCard({ nextReview: Date.now() + 100000 });
      expect(isDueForReview(card)).toBe(false);
    });
  });

  describe('getDueCards', () => {
    it('returns only due cards sorted by nextReview', () => {
      const cards = [
        makeCard({ id: 'a', nextReview: Date.now() + 100000 }),
        makeCard({ id: 'b', nextReview: Date.now() - 2000 }),
        makeCard({ id: 'c', nextReview: Date.now() - 1000 }),
      ];
      const due = getDueCards(cards);
      expect(due).toHaveLength(2);
      expect(due[0].id).toBe('b');
      expect(due[1].id).toBe('c');
    });

    it('returns empty array when no cards are due', () => {
      const cards = [makeCard({ nextReview: Date.now() + 100000 })];
      expect(getDueCards(cards)).toHaveLength(0);
    });
  });

  describe('getMasteryStats', () => {
    it('counts cards by mastery level', () => {
      const cards = [
        makeCard({ mastery: 'new' }),
        makeCard({ mastery: 'new' }),
        makeCard({ mastery: 'learning' }),
        makeCard({ mastery: 'reviewing' }),
        makeCard({ mastery: 'mastered' }),
      ];
      const stats = getMasteryStats(cards);
      expect(stats).toEqual({ new: 2, learning: 1, reviewing: 1, mastered: 1, total: 5 });
    });

    it('returns zeros for empty array', () => {
      expect(getMasteryStats([])).toEqual({ new: 0, learning: 0, reviewing: 0, mastered: 0, total: 0 });
    });
  });
});
