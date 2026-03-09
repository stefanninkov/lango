import type { VocabReviewCard, ReviewQuality, Mastery } from '../types';

/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo SM-2 algorithm by Piotr Wozniak
 *
 * Quality scale:
 *   0 - Complete blackout
 *   1 - Incorrect; remembered upon seeing answer
 *   2 - Incorrect; answer seemed easy to recall
 *   3 - Correct with serious difficulty
 *   4 - Correct with some hesitation
 *   5 - Perfect recall
 */

export function calculateNextReview(
  card: VocabReviewCard,
  quality: ReviewQuality
): Pick<VocabReviewCard, 'easeFactor' | 'interval' | 'repetitions' | 'nextReview' | 'mastery' | 'lastReviewed'> {
  const now = Date.now();
  let { easeFactor, interval, repetitions } = card;

  if (quality < 3) {
    // Failed recall — reset repetitions, short interval
    repetitions = 0;
    interval = 1;
  } else {
    // Successful recall
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  // Update ease factor (minimum 1.3)
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Calculate mastery level
  const mastery = getMastery(repetitions, interval);

  const nextReview = now + interval * 24 * 60 * 60 * 1000;

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview,
    mastery,
    lastReviewed: now,
  };
}

function getMastery(repetitions: number, interval: number): Mastery {
  if (repetitions === 0) return 'new';
  if (repetitions <= 2) return 'learning';
  if (interval >= 21) return 'mastered';
  return 'reviewing';
}

export function createNewCard(
  vocabId: string,
  word: string,
  translation: string,
  pronunciation: string,
  courseId: string,
  lessonId: string
): VocabReviewCard {
  return {
    id: vocabId,
    word,
    translation,
    pronunciation,
    courseId: courseId as any,
    lessonId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: Date.now(), // Available immediately
    mastery: 'new',
    lastReviewed: 0,
  };
}

export function isDueForReview(card: VocabReviewCard): boolean {
  return Date.now() >= card.nextReview;
}

export function getDueCards(cards: VocabReviewCard[]): VocabReviewCard[] {
  return cards
    .filter(isDueForReview)
    .sort((a, b) => a.nextReview - b.nextReview);
}

export function getMasteryStats(cards: VocabReviewCard[]) {
  const stats = { new: 0, learning: 0, reviewing: 0, mastered: 0, total: cards.length };
  for (const card of cards) {
    stats[card.mastery]++;
  }
  return stats;
}
