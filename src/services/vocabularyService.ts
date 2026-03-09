import { USE_MOCK } from '../config/env';
import * as mock from './mockVocabularyService';

// For now, only mock is implemented
const impl = mock;

export const getCards = impl.getCards;
export const saveCard = impl.saveCard;
export const saveCards = impl.saveCards;
export const updateCard = impl.updateCard;
export const deleteCard = impl.deleteCard;
