import * as mock from './mockChatService';
import * as claude from './claudeChatService';
import * as storage from './storageService';
import type { ChatMessage, Conversation } from '../types';

// Cache the API key in memory to avoid async lookups on every call
let cachedApiKey: string | null = null;
let keyLoaded = false;

export async function loadApiKey(): Promise<string | null> {
  cachedApiKey = await storage.loadApiKey();
  keyLoaded = true;
  return cachedApiKey;
}

export function getCachedApiKey(): string | null {
  return cachedApiKey;
}

export function setApiKeyCache(key: string | null): void {
  cachedApiKey = key;
  keyLoaded = true;
}

export function isUsingClaudeApi(): boolean {
  return !!cachedApiKey;
}

export async function getConversations(uid: string): Promise<Conversation[]> {
  if (cachedApiKey) return claude.getConversations(uid);
  return mock.getConversations(uid);
}

export async function startConversation(
  uid: string,
  targetLang: string,
  topic: string
): Promise<Conversation> {
  if (cachedApiKey) return claude.startConversation(uid, targetLang, topic);
  return mock.startConversation(uid, targetLang, topic);
}

export async function sendMessage(
  uid: string,
  conversationId: string,
  content: string,
  targetLang: string,
  userLevel?: string
): Promise<ChatMessage> {
  if (cachedApiKey) {
    return claude.sendMessage(uid, conversationId, content, targetLang, cachedApiKey, userLevel);
  }
  return mock.sendMessage(uid, conversationId, content, targetLang);
}

export async function deleteConversation(uid: string, conversationId: string): Promise<void> {
  if (cachedApiKey) return claude.deleteConversation(uid, conversationId);
  return mock.deleteConversation(uid, conversationId);
}
