import {
  getCards,
  saveCard,
  saveCards,
  updateCard,
  deleteCard,
  _clearAll,
} from '../../src/services/mockVocabularyService';
import { createNewCard } from '../../src/utils/sm2';
import type { CourseId } from '../../src/types';

const uid = 'test-user';
const courseId: CourseId = 'en-es';

beforeEach(() => {
  _clearAll();
});

describe('mockVocabularyService', () => {
  it('returns empty array for new user', async () => {
    const cards = await getCards(uid, courseId);
    expect(cards).toEqual([]);
  });

  it('saves and retrieves a card', async () => {
    const card = createNewCard('hola', 'Hola', 'Hello', 'OH-lah', courseId, 'lesson-1');
    await saveCard(uid, courseId, card);
    const cards = await getCards(uid, courseId);
    expect(cards).toHaveLength(1);
    expect(cards[0].word).toBe('Hola');
  });

  it('updates existing card on duplicate save', async () => {
    const card = createNewCard('hola', 'Hola', 'Hello', 'OH-lah', courseId, 'lesson-1');
    await saveCard(uid, courseId, card);
    await saveCard(uid, courseId, { ...card, easeFactor: 2.0 });
    const cards = await getCards(uid, courseId);
    expect(cards).toHaveLength(1);
    expect(cards[0].easeFactor).toBe(2.0);
  });

  it('saves multiple cards at once', async () => {
    const cards = [
      createNewCard('hola', 'Hola', 'Hello', 'OH-lah', courseId, 'lesson-1'),
      createNewCard('adios', 'Adiós', 'Goodbye', 'ah-DYOS', courseId, 'lesson-1'),
    ];
    await saveCards(uid, courseId, cards);
    const result = await getCards(uid, courseId);
    expect(result).toHaveLength(2);
  });

  it('updates specific card fields', async () => {
    const card = createNewCard('hola', 'Hola', 'Hello', 'OH-lah', courseId, 'lesson-1');
    await saveCard(uid, courseId, card);
    await updateCard(uid, courseId, 'hola', { easeFactor: 1.8, interval: 6 });
    const cards = await getCards(uid, courseId);
    expect(cards[0].easeFactor).toBe(1.8);
    expect(cards[0].interval).toBe(6);
    expect(cards[0].word).toBe('Hola'); // unchanged
  });

  it('deletes a card', async () => {
    const card = createNewCard('hola', 'Hola', 'Hello', 'OH-lah', courseId, 'lesson-1');
    await saveCard(uid, courseId, card);
    await deleteCard(uid, courseId, 'hola');
    const cards = await getCards(uid, courseId);
    expect(cards).toHaveLength(0);
  });

  it('isolates cards by course', async () => {
    const card1 = createNewCard('hola', 'Hola', 'Hello', 'OH-lah', 'en-es', 'lesson-1');
    const card2 = createNewCard('ciao', 'Ciao', 'Hello', 'CHOW', 'en-it', 'lesson-1');
    await saveCard(uid, 'en-es', card1);
    await saveCard(uid, 'en-it', card2);
    const esCards = await getCards(uid, 'en-es');
    const itCards = await getCards(uid, 'en-it');
    expect(esCards).toHaveLength(1);
    expect(itCards).toHaveLength(1);
    expect(esCards[0].word).toBe('Hola');
    expect(itCards[0].word).toBe('Ciao');
  });
});
