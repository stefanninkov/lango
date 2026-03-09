import type { ChatMessage, Conversation } from '../types';

// Mock AI chat service — simulates Claude API responses for conversation practice
// In production, this would call the Claude API

const conversations: Record<string, Conversation[]> = {};

const MOCK_RESPONSES: Record<string, string[]> = {
  es: [
    '¡Muy bien! Tu español está mejorando mucho. 🎉 Let me help you with a small correction: ',
    '¡Excelente! That\'s a great sentence. Here\'s how a native speaker might say it: ',
    '¡Buen trabajo! You\'re making great progress. Try to remember that in Spanish, ',
    '¡Fantástico! Keep practicing. One thing to note: ',
    '¡Perfecto! Your pronunciation guide looks good. A useful phrase to know is: ',
  ],
  it: [
    'Molto bene! Il tuo italiano sta migliorando! 🎉 A small tip: ',
    'Eccellente! That\'s correct. A native speaker might also say: ',
    'Bravo/a! You\'re doing great. Remember that in Italian, ',
    'Fantastico! Keep it up. One thing to note: ',
    'Perfetto! Your Italian is improving. A useful expression is: ',
  ],
};

const CORRECTIONS: Record<string, { input: RegExp; correction: string }[]> = {
  es: [
    { input: /yo soy tengo/i, correction: 'Use "yo tengo" (I have) — "soy" means "I am"' },
    { input: /esta bueno/i, correction: '"Está bueno" is correct for food/things. For weather or general state, use "está bien"' },
    { input: /me llamo es/i, correction: 'Just say "Me llamo [name]" — no "es" needed after "llamo"' },
  ],
  it: [
    { input: /io sono ho/i, correction: 'Use "io ho" (I have) — "sono" means "I am"' },
    { input: /mi chiamo è/i, correction: 'Just say "Mi chiamo [name]" — no "è" needed' },
  ],
};

const TOPIC_STARTERS: Record<string, Record<string, string>> = {
  es: {
    greetings: '¡Hola! 👋 Let\'s practice greetings in Spanish. How would you say "Good morning" to someone?',
    food: '🍽️ Let\'s talk about food! What\'s your favorite meal? Try to answer in Spanish.',
    travel: '✈️ Imagine you\'re traveling to Madrid. How would you ask for directions to the hotel in Spanish?',
    daily: '☀️ Let\'s practice daily routines. Can you describe what you do in the morning in Spanish?',
    free: '¡Hola! I\'m your Spanish conversation partner. You can talk to me about anything in Spanish (or mix with English). I\'ll help correct your grammar and teach new vocabulary as we chat!',
  },
  it: {
    greetings: 'Ciao! 👋 Let\'s practice greetings in Italian. How would you say "Good morning" in Italian?',
    food: '🍕 Let\'s talk about Italian food! What\'s your favorite Italian dish? Try to answer in Italian.',
    travel: '✈️ Imagine you\'re visiting Rome. How would you ask for directions in Italian?',
    daily: '☀️ Let\'s practice daily routines. Can you describe your morning in Italian?',
    free: 'Ciao! I\'m your Italian conversation partner. You can talk to me about anything in Italian (or mix with English). I\'ll help correct your grammar and teach new vocabulary as we chat!',
  },
};

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getMockResponse(targetLang: string, userMessage: string): { content: string; correction?: string } {
  const lang = targetLang === 'es' ? 'es' : 'it';
  const responses = MOCK_RESPONSES[lang];
  const corrections = CORRECTIONS[lang] ?? [];

  // Check for corrections
  for (const c of corrections) {
    if (c.input.test(userMessage)) {
      const response = responses[Math.floor(Math.random() * responses.length)];
      return { content: response + c.correction, correction: c.correction };
    }
  }

  // Generic encouraging response
  const response = responses[Math.floor(Math.random() * responses.length)];
  const tips = lang === 'es'
    ? ['adjectives usually come after the noun.', '"ser" is for permanent things, "estar" is for temporary states.', 'verb endings change based on who is doing the action.']
    : ['adjectives usually agree with the noun in gender and number.', '"essere" is for identity/characteristics, "avere" is used for age and many expressions.', 'Italian has formal (Lei) and informal (tu) forms of address.'];

  const tip = tips[Math.floor(Math.random() * tips.length)];
  return { content: response + tip };
}

export async function getConversations(uid: string): Promise<Conversation[]> {
  return conversations[uid] ?? [];
}

export async function startConversation(
  uid: string,
  targetLang: string,
  topic: string
): Promise<Conversation> {
  const lang = targetLang === 'es' ? 'es' : 'it';
  const starters = TOPIC_STARTERS[lang] ?? TOPIC_STARTERS.es;
  const starterMessage = starters[topic] ?? starters.free;

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
  targetLang: string
): Promise<ChatMessage> {
  // Add user message
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

  // Generate AI response (simulated delay)
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

  const { content: responseContent, correction } = getMockResponse(targetLang, content);
  const aiMsg: ChatMessage = {
    id: generateId(),
    role: 'assistant',
    content: responseContent,
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
