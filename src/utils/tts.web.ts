import type { TargetLanguage } from '../types';

const LANGUAGE_LOCALES: Record<TargetLanguage, string> = {
  es: 'es-ES',
  it: 'it-IT',
};

export function speak(text: string, language: TargetLanguage, rate: number = 0.85): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANGUAGE_LOCALES[language];
  utterance.rate = rate;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

export function speakSlow(text: string, language: TargetLanguage): void {
  speak(text, language, 0.6);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export async function isSpeaking(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}
