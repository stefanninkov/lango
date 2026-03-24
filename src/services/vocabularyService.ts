import { USE_MOCK } from '../config/env';

const services = USE_MOCK
  ? require('./mockVocabularyService')
  : require('./firebaseVocabularyService');

export const getCards: typeof import('./firebaseVocabularyService').getCards = services.getCards;
export const saveCard: typeof import('./firebaseVocabularyService').saveCard = services.saveCard;
export const saveCards: typeof import('./firebaseVocabularyService').saveCards = services.saveCards;
export const updateCard: typeof import('./firebaseVocabularyService').updateCard = services.updateCard;
export const deleteCard: typeof import('./firebaseVocabularyService').deleteCard = services.deleteCard;
