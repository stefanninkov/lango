import type { VocabReviewCard, CourseId } from '../types';

// In-memory storage for vocabulary review cards
const cardStore: Record<string, VocabReviewCard[]> = {};

function getKey(uid: string, courseId: CourseId): string {
  return `${uid}:${courseId}`;
}

export async function getCards(uid: string, courseId: CourseId): Promise<VocabReviewCard[]> {
  return cardStore[getKey(uid, courseId)] ?? [];
}

export async function saveCard(uid: string, courseId: CourseId, card: VocabReviewCard): Promise<void> {
  const key = getKey(uid, courseId);
  if (!cardStore[key]) cardStore[key] = [];
  const idx = cardStore[key].findIndex((c) => c.id === card.id);
  if (idx >= 0) {
    cardStore[key][idx] = card;
  } else {
    cardStore[key].push(card);
  }
}

export async function saveCards(uid: string, courseId: CourseId, cards: VocabReviewCard[]): Promise<void> {
  for (const card of cards) {
    await saveCard(uid, courseId, card);
  }
}

export async function updateCard(
  uid: string,
  courseId: CourseId,
  cardId: string,
  updates: Partial<VocabReviewCard>
): Promise<void> {
  const key = getKey(uid, courseId);
  const cards = cardStore[key];
  if (!cards) return;
  const idx = cards.findIndex((c) => c.id === cardId);
  if (idx >= 0) {
    cards[idx] = { ...cards[idx], ...updates };
  }
}

export async function deleteCard(uid: string, courseId: CourseId, cardId: string): Promise<void> {
  const key = getKey(uid, courseId);
  if (!cardStore[key]) return;
  cardStore[key] = cardStore[key].filter((c) => c.id !== cardId);
}

// Test helper
export function _clearAll(): void {
  for (const key of Object.keys(cardStore)) {
    delete cardStore[key];
  }
}
