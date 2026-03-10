import type { ChatMessage, Conversation } from '../types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

const conversations: Record<string, Conversation[]> = {};

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getSystemPrompt(targetLang: string, topic: string): string {
  const langName = targetLang === 'es' ? 'Spanish' : 'Italian';
  return `You are a friendly, encouraging ${langName} language tutor in a mobile app called Lango.

Your role:
- Help the user practice ${langName} conversation on the topic: "${topic}"
- Respond primarily in ${langName} with brief English explanations when needed
- Gently correct grammar/vocabulary mistakes — put corrections in a SEPARATE line starting with "[Correction]:" so the app can display them specially
- Keep responses concise (2-4 sentences max) — this is a mobile chat
- Adapt to the user's level — if they write in English, encourage them to try in ${langName}
- Be warm and motivating, celebrate progress
- If the topic is "free", follow wherever the conversation goes

Important formatting rule:
- If the user made a mistake, your LAST line should be: [Correction]: <brief explanation of the mistake>
- Only include [Correction] when there's actually a mistake to correct`;
}

function getTopicStarter(targetLang: string, topic: string): string {
  const starters: Record<string, Record<string, string>> = {
    es: {
      greetings: '¡Hola! 👋 Vamos a practicar saludos en español. ¿Cómo te presentarías a alguien nuevo?',
      food: '🍽️ ¡Hablemos de comida! ¿Cuál es tu plato favorito? Intenta responder en español.',
      travel: '✈️ Imagina que estás viajando a Madrid. ¿Cómo pedirías direcciones al hotel?',
      daily: '☀️ ¡Practiquemos rutinas diarias! ¿Qué haces por la mañana? Descríbelo en español.',
      free: '¡Hola! Soy tu compañero de conversación en español. Podemos hablar de lo que quieras — ¡en español, por supuesto! Te ayudaré con la gramática. ¿De qué te gustaría hablar?',
    },
    it: {
      greetings: 'Ciao! 👋 Pratichiamo i saluti in italiano. Come ti presenteresti a qualcuno di nuovo?',
      food: '🍕 Parliamo di cibo italiano! Qual è il tuo piatto preferito? Prova a rispondere in italiano.',
      travel: '✈️ Immagina di visitare Roma. Come chiederesti indicazioni in italiano?',
      daily: '☀️ Pratichiamo le routine quotidiane! Cosa fai la mattina? Descrivilo in italiano.',
      free: 'Ciao! Sono il tuo partner di conversazione in italiano. Possiamo parlare di tutto — in italiano, ovviamente! Ti aiuterò con la grammatica. Di cosa vorresti parlare?',
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
  const starterMessage = getTopicStarter(targetLang, topic);

  const conversation: Conversation = {
    id: `conv-${Date.now()}`,
    topic,
    messages: [
      {
        id: generateId(),
        role: 'assistant',
        content: starterMessage,
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
  apiKey: string
): Promise<ChatMessage> {
  const userConvs = conversations[uid] ?? [];
  const conv = userConvs.find((c) => c.id === conversationId);
  if (!conv) throw new Error('Conversation not found');

  // Add user message to history
  const userMsg: ChatMessage = {
    id: generateId(),
    role: 'user',
    content,
    timestamp: Date.now(),
  };
  conv.messages.push(userMsg);

  // Build messages for Claude API (exclude system messages, map to API format)
  const apiMessages = conv.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      system: getSystemPrompt(targetLang, conv.topic),
      messages: apiMessages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your Claude API key in Settings.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit reached. Please wait a moment and try again.');
    }
    throw new Error(`API error (${response.status}): ${errorBody || 'Unknown error'}`);
  }

  const data = await response.json();
  const rawContent = data.content?.[0]?.text ?? 'Sorry, I could not generate a response.';

  const { text, correction } = parseCorrection(rawContent);

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
