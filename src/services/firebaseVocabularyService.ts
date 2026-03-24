import { doc, getDoc, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { VocabReviewCard, CourseId } from '../types';

const vocabDocRef = (uid: string, courseId: CourseId) =>
  doc(db, 'users', uid, 'vocabulary', courseId);

export async function getCards(uid: string, courseId: CourseId): Promise<VocabReviewCard[]> {
  const snap = await getDoc(vocabDocRef(uid, courseId));
  if (!snap.exists()) return [];
  const data = snap.data();
  return Object.values(data.cards ?? {}) as VocabReviewCard[];
}

export async function saveCard(uid: string, courseId: CourseId, card: VocabReviewCard): Promise<void> {
  const ref = vocabDocRef(uid, courseId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { cards: { [card.id]: card } });
  } else {
    await updateDoc(ref, { [`cards.${card.id}`]: card });
  }
}

export async function saveCards(uid: string, courseId: CourseId, cards: VocabReviewCard[]): Promise<void> {
  const ref = vocabDocRef(uid, courseId);
  const cardsMap: Record<string, VocabReviewCard> = {};
  for (const card of cards) {
    cardsMap[card.id] = card;
  }
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { cards: cardsMap });
  } else {
    const updates: Record<string, VocabReviewCard> = {};
    for (const [id, card] of Object.entries(cardsMap)) {
      updates[`cards.${id}`] = card;
    }
    await updateDoc(ref, updates);
  }
}

export async function updateCard(
  uid: string,
  courseId: CourseId,
  cardId: string,
  updates: Partial<VocabReviewCard>
): Promise<void> {
  const ref = vocabDocRef(uid, courseId);
  const fieldUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    fieldUpdates[`cards.${cardId}.${key}`] = value;
  }
  await updateDoc(ref, fieldUpdates);
}

export async function deleteCard(uid: string, courseId: CourseId, cardId: string): Promise<void> {
  await updateDoc(vocabDocRef(uid, courseId), {
    [`cards.${cardId}`]: deleteField(),
  });
}
