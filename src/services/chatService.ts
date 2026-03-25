import * as mock from './mockChatService';
import * as claude from './claudeChatService';
import * as cloud from './cloudChatService';
import * as storage from './storageService';
import type { ChatMessage, Conversation } from '../types';

// Chat backend modes:
// 'mock' - local pre-scripted responses (no API key)
// 'direct' - client-side Claude API calls (user's own API key)
// 'cloud' - Firebase Cloud Functions (server-side API key)
type ChatBackend = 'mock' | 'direct' | 'cloud';

let cachedApiKey: string | null = null;
let keyLoaded = false;
let useCloudBackend = false;

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

export function setUseCloudBackend(enabled: boolean): void {
  useCloudBackend = enabled;
}

export function isUsingClaudeApi(): boolean {
  return !!cachedApiKey || useCloudBackend;
}

function getBackend(): ChatBackend {
  if (useCloudBackend) return 'cloud';
  if (cachedApiKey) return 'direct';
  return 'mock';
}

export async function getConversations(uid: string): Promise<Conversation[]> {
  const backend = getBackend();
  if (backend === 'cloud') return cloud.getConversations(uid);
  if (backend === 'direct') return claude.getConversations(uid);
  return mock.getConversations(uid);
}

export async function startConversation(
  uid: string,
  targetLang: string,
  topic: string
): Promise<Conversation> {
  const backend = getBackend();
  if (backend === 'cloud') return cloud.startConversation(uid, targetLang, topic);
  if (backend === 'direct') return claude.startConversation(uid, targetLang, topic);
  return mock.startConversation(uid, targetLang, topic);
}

export async function sendMessage(
  uid: string,
  conversationId: string,
  content: string,
  targetLang: string,
  userLevel?: string
): Promise<ChatMessage> {
  const backend = getBackend();
  if (backend === 'cloud') {
    return cloud.sendMessage(uid, conversationId, content, targetLang, userLevel);
  }
  if (backend === 'direct') {
    return claude.sendMessage(uid, conversationId, content, targetLang, cachedApiKey!, userLevel);
  }
  return mock.sendMessage(uid, conversationId, content, targetLang);
}

export async function deleteConversation(uid: string, conversationId: string): Promise<void> {
  const backend = getBackend();
  if (backend === 'cloud') return cloud.deleteConversation(uid, conversationId);
  if (backend === 'direct') return claude.deleteConversation(uid, conversationId);
  return mock.deleteConversation(uid, conversationId);
}
