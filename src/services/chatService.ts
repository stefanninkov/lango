import { USE_MOCK } from '../config/env';
import * as mock from './mockChatService';

// For now, only mock is implemented
// In production, this would switch to a Claude API implementation
const impl = mock;

export const getConversations = impl.getConversations;
export const startConversation = impl.startConversation;
export const sendMessage = impl.sendMessage;
export const deleteConversation = impl.deleteConversation;
