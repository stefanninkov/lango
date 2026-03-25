import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineString } from 'firebase-functions/params';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

// Server-side API key stored in Firebase Functions config
const claudeApiKey = defineString('CLAUDE_API_KEY', {
  description: 'Anthropic Claude API key for AI conversations',
});

// Simple per-user rate limiting (in-memory, resets on cold start)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30; // max requests per window
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(uid: string): void {
  const now = Date.now();
  const entry = rateLimits.get(uid);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(uid, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return;
  }

  if (entry.count >= RATE_LIMIT) {
    throw new HttpsError(
      'resource-exhausted',
      'Rate limit exceeded. Please try again later.'
    );
  }

  entry.count++;
}

export const chat = onCall(
  { maxInstances: 10, timeoutSeconds: 30 },
  async (request) => {
    // Require authenticated user
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in to use AI chat.');
    }

    const { messages, system } = request.data;

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new HttpsError('invalid-argument', 'Messages array is required.');
    }
    if (typeof system !== 'string') {
      throw new HttpsError('invalid-argument', 'System prompt is required.');
    }

    const apiKey = claudeApiKey.value();
    if (!apiKey) {
      throw new HttpsError(
        'failed-precondition',
        'AI chat is not configured. Please set up the Claude API key.'
      );
    }

    checkRateLimit(request.auth.uid);

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      if (response.status === 429) {
        throw new HttpsError('resource-exhausted', 'API rate limit reached. Try again shortly.');
      }
      throw new HttpsError('internal', `Claude API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? '';

    return { content };
  }
);
