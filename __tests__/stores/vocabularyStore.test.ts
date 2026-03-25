import { createNewCard, calculateNextReview, getDueCards, getMasteryStats, isDueForReview } from '../../src/utils/sm2';
import type { VocabReviewCard, ReviewQuality } from '../../src/types';

describe('Vocabulary Store Logic', () => {
  describe('createNewCard', () => {
    it('creates a card with correct defaults', () => {
      const card = createNewCard('v1', 'hola', 'hello', 'OH-lah', 'en-es', 'lesson-1');
      expect(card.id).toBe('v1');
      expect(card.word).toBe('hola');
      expect(card.translation).toBe('hello');
      expect(card.pronunciation).toBe('OH-lah');
      expect(card.courseId).toBe('en-es');
      expect(card.lessonId).toBe('lesson-1');
      expect(card.easeFactor).toBe(2.5);
      expect(card.interval).toBe(0);
      expect(card.repetitions).toBe(0);
      expect(card.mastery).toBe('new');
    });

    it('new cards are immediately due for review', () => {
      const card = createNewCard('v1', 'hola', 'hello', 'OH-lah', 'en-es', 'lesson-1');
      expect(isDueForReview(card)).toBe(true);
    });
  });

  describe('calculateNextReview', () => {
    const baseCard: VocabReviewCard = {
      id: 'v1',
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
    };

    it('resets on failed recall (quality < 3)', () => {
      const result = calculateNextReview(baseCard, 1);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.mastery).toBe('new');
    });

    it('progresses on successful recall (quality >= 3)', () => {
      const result = calculateNextReview(baseCard, 4);
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.mastery).toBe('learning');
    });

    it('sets interval to 6 on second successful recall', () => {
      const afterFirst = calculateNextReview(baseCard, 4);
      const cardAfterFirst = { ...baseCard, ...afterFirst };
      const afterSecond = calculateNextReview(cardAfterFirst, 4);
      expect(afterSecond.repetitions).toBe(2);
      expect(afterSecond.interval).toBe(6);
      expect(afterSecond.mastery).toBe('learning');
    });

    it('uses ease factor for subsequent intervals', () => {
      const card: VocabReviewCard = {
        ...baseCard,
        repetitions: 2,
        interval: 6,
        easeFactor: 2.5,
      };
      const result = calculateNextReview(card, 4);
      expect(result.repetitions).toBe(3);
      expect(result.interval).toBe(15); // 6 * 2.5 = 15
      expect(result.mastery).toBe('reviewing');
    });

    it('reaches mastered status with high interval', () => {
      const card: VocabReviewCard = {
        ...baseCard,
        repetitions: 4,
        interval: 15,
        easeFactor: 2.5,
      };
      const result = calculateNextReview(card, 5);
      expect(result.interval).toBe(38); // 15 * 2.5 = 37.5 => 38
      expect(result.mastery).toBe('mastered');
    });

    it('never drops ease factor below 1.3', () => {
      const card: VocabReviewCard = { ...baseCard, easeFactor: 1.3 };
      const result = calculateNextReview(card, 0);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('perfect recall increases ease factor', () => {
      const result = calculateNextReview(baseCard, 5);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });
  });

  describe('getDueCards', () => {
    it('returns only due cards sorted by nextReview', () => {
      const now = Date.now();
      const cards: VocabReviewCard[] = [
        { ...createNewCard('v1', 'a', 'a', 'a', 'en-es', 'l1'), nextReview: now - 1000 },
        { ...createNewCard('v2', 'b', 'b', 'b', 'en-es', 'l1'), nextReview: now + 100000 },
        { ...createNewCard('v3', 'c', 'c', 'c', 'en-es', 'l1'), nextReview: now - 5000 },
      ];
      const due = getDueCards(cards);
      expect(due).toHaveLength(2);
      expect(due[0].id).toBe('v3'); // Earlier due date first
      expect(due[1].id).toBe('v1');
    });

    it('returns empty array when no cards are due', () => {
      const cards: VocabReviewCard[] = [
        { ...createNewCard('v1', 'a', 'a', 'a', 'en-es', 'l1'), nextReview: Date.now() + 100000 },
      ];
      expect(getDueCards(cards)).toHaveLength(0);
    });
  });

  describe('getMasteryStats', () => {
    it('counts cards by mastery level', () => {
      const cards: VocabReviewCard[] = [
        { ...createNewCard('v1', 'a', 'a', 'a', 'en-es', 'l1'), mastery: 'new' },
        { ...createNewCard('v2', 'b', 'b', 'b', 'en-es', 'l1'), mastery: 'learning' },
        { ...createNewCard('v3', 'c', 'c', 'c', 'en-es', 'l1'), mastery: 'learning' },
        { ...createNewCard('v4', 'd', 'd', 'd', 'en-es', 'l1'), mastery: 'reviewing' },
        { ...createNewCard('v5', 'e', 'e', 'e', 'en-es', 'l1'), mastery: 'mastered' },
      ];
      const stats = getMasteryStats(cards);
      expect(stats.new).toBe(1);
      expect(stats.learning).toBe(2);
      expect(stats.reviewing).toBe(1);
      expect(stats.mastered).toBe(1);
      expect(stats.total).toBe(5);
    });

    it('returns zeros for empty array', () => {
      const stats = getMasteryStats([]);
      expect(stats.total).toBe(0);
      expect(stats.new).toBe(0);
    });
  });
});
