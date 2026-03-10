import * as Speech from 'expo-speech';
import type { TargetLanguage } from '../types';

// Map target language codes to BCP-47 locale codes for TTS
const LANGUAGE_LOCALES: Record<TargetLanguage, string> = {
  es: 'es-ES',
  it: 'it-IT',
};

/**
 * Speak a word or sentence in the target language using device TTS.
 */
export function speak(text: string, language: TargetLanguage, rate: number = 0.85): void {
  Speech.speak(text, {
    language: LANGUAGE_LOCALES[language],
    rate,
    pitch: 1.0,
  });
}

/**
 * Speak slowly (for vocabulary learning).
 */
export function speakSlow(text: string, language: TargetLanguage): void {
  speak(text, language, 0.6);
}

/**
 * Stop any current speech.
 */
export function stopSpeaking(): void {
  Speech.stop();
}

/**
 * Check if TTS is currently speaking.
 */
export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}
