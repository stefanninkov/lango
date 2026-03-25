import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config/firebase';
import type { ChatMessage, Conversation } from '../types';

const functions = getFunctions(app);
const chatFn = httpsCallable<
  { messages: { role: string; content: string }[]; system: string },
  { content: string }
>(functions, 'chat');

// Local conversation state (same pattern as claudeChatService)
const conversations: Record<string, Conversation[]> = {};

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const CEFR_GUIDANCE: Record<string, string> = {
  A1: 'The user is a complete beginner (CEFR A1). Use very simple vocabulary, short sentences, and mostly their native language with key target words.',
  A2: 'The user is at elementary level (CEFR A2). Use simple everyday expressions and basic phrases. Mix target language with native explanations.',
  B1: 'The user is at intermediate level (CEFR B1). Use the target language primarily. Introduce some complex grammar and vocabulary naturally.',
  B2: 'The user is at upper intermediate level (CEFR B2). Speak almost entirely in the target language. Challenge them with idiomatic expressions.',
  C1: 'The user is at advanced level (CEFR C1). Use the target language exclusively with sophisticated vocabulary. Focus on nuance and cultural context.',
  C2: 'The user is at mastery level (CEFR C2). Use the target language exclusively at native speed with idioms, humor, and cultural references.',
};

function getSystemPrompt(targetLang: string, topic: string, userLevel?: string): string {
  const langName = targetLang === 'es' ? 'Spanish' : 'Italian';
  const levelGuide = CEFR_GUIDANCE[userLevel ?? 'A1'] ?? CEFR_GUIDANCE.A1;
  return `You are a friendly ${langName} language tutor in Lango.\n\n${levelGuide}\n\nTopic: "${topic}"\n- Respond primarily in ${langName} with brief English explanations when needed\n- Correct mistakes with [Correction]: on a separate line\n- Keep responses concise (2-4 sentences)\n- Be warm and motivating`;
}

function getTopicStarter(targetLang: string, topic: string): string {
  const starters: Record<string, Record<string, string>> = {
    es: {
      greetings: '¡Hola! 👋 Vamos a practicar saludos en español. ¿Cómo te presentarías a alguien nuevo?',
      food: '🍽️ ¡Hablemos de comida! ¿Cuál es tu plato favorito? Intenta responder en español.',
      travel: '✈️ Imagina que estás viajando a Madrid. ¿Cómo pedirías direcciones al hotel?',
      daily: '☀️ ¡Practiquemos rutinas diarias! ¿Qué haces por la mañana?',
      free: '¡Hola! Soy tu compañero de conversación en español. ¿De qué te gustaría hablar?',
    },
    it: {
      greetings: 'Ciao! 👋 Pratichiamo i saluti in italiano. Come ti presenteresti a qualcuno di nuovo?',
      food: '🍕 Parliamo di cibo italiano! Qual è il tuo piatto preferito?',
      travel: '✈️ Immagina di visitare Roma. Come chiederesti indicazioni in italiano?',
      daily: '☀️ Pratichiamo le routine quotidiane! Cosa fai la mattina?',
      free: 'Ciao! Sono il tuo partner di conversazione in italiano. Di cosa vorresti parlare?',
    },
  };
  const lang = targetLang === 'es' ? 'es' : 'it';
  return starters[lang]?.[topic] ?? starters[lang].free;
}

function parseCorrection(content: string): { text: string; correction?: string } {
  const correctionMatch = content.match(/\[Correction\]:\s*(.+)$/m);
  if (correctionMatch) {
    const text = content.replace(/\n?\[Correction\]:\s*.+$/m, '').trim();
    return { text, correction: correctionMatch[1].trim() };
  }
  return { text: content };
}

export async function getConversations(uid: string): Promise<Conversation[]> {
  return conversations[uid] ?? [];
}

export async function startConversation(
  uid: string,
  targetLang: string,
  topic: string
): Promise<Conversation> {
  const conversation: Conversation = {
    id: `conv-${Date.now()}`,
    topic,
    messages: [
      {
        id: generateId(),
        role: 'assistant',
        content: getTopicStarter(targetLang, topic),
        timestamp: Date.now(),
      },
    ],
    createdAt: Date.now(),
  };
  if (!conversations[uid]) conversations[uid] = [];
  conversations[uid].push(conversation);
  return conversation;
}

export async function sendMessage(
  uid: string,
  conversationId: string,
  content: string,
  targetLang: string,
  userLevel?: string
): Promise<ChatMessage> {
  const userConvs = conversations[uid] ?? [];
  const conv = userConvs.find((c) => c.id === conversationId);
  if (!conv) throw new Error('Conversation not found');

  const userMsg: ChatMessage = {
    id: generateId(),
    role: 'user',
    content,
    timestamp: Date.now(),
  };
  conv.messages.push(userMsg);

  const apiMessages = conv.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const system = getSystemPrompt(targetLang, conv.topic, userLevel);

  const result = await chatFn({ messages: apiMessages, system });
  const { text, correction } = parseCorrection(result.data.content);

  const aiMsg: ChatMessage = {
    id: generateId(),
    role: 'assistant',
    content: text,
    timestamp: Date.now(),
    correction,
  };
  conv.messages.push(aiMsg);
  return aiMsg;
}

export async function deleteConversation(uid: string, conversationId: string): Promise<void> {
  if (!conversations[uid]) return;
  conversations[uid] = conversations[uid].filter((c) => c.id !== conversationId);
}
