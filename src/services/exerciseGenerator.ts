import type { VocabularyItem, Exercise, MultipleChoiceExercise, FillBlankExercise } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'lango_extra_exercises_';

/**
 * Generate supplementary exercises from lesson vocabulary.
 * Uses local generation (no API call needed) for quick offline-first exercises.
 * Results are cached to avoid regenerating the same exercises.
 */
export async function generateExercises(
  lessonId: string,
  vocabulary: VocabularyItem[],
  targetLang: string
): Promise<Exercise[]> {
  // Check cache first
  const cacheKey = `${CACHE_PREFIX}${lessonId}`;
  const cached = await AsyncStorage.getItem(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const exercises: Exercise[] = [];

  // Generate reverse translation exercises (native → target)
  for (const vocab of vocabulary) {
    const mcExercise = generateMultipleChoice(vocab, vocabulary, targetLang);
    if (mcExercise) exercises.push(mcExercise);
  }

  // Generate fill-in-the-blank from examples
  for (const vocab of vocabulary) {
    const fillExercise = generateFillBlank(vocab);
    if (fillExercise) exercises.push(fillExercise);
  }

  // Shuffle exercises for variety
  for (let i = exercises.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [exercises[i], exercises[j]] = [exercises[j], exercises[i]];
  }

  // Cache the generated exercises
  await AsyncStorage.setItem(cacheKey, JSON.stringify(exercises));

  return exercises;
}

function generateMultipleChoice(
  target: VocabularyItem,
  allVocab: VocabularyItem[],
  targetLang: string
): MultipleChoiceExercise | null {
  if (allVocab.length < 4) return null;

  // Create distractors from other vocabulary items
  const others = allVocab.filter((v) => v.id !== target.id);
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 3).map((v) => v.word);

  // Insert correct answer at random position
  const correctIndex = Math.floor(Math.random() * 4);
  const options = [...distractors];
  options.splice(correctIndex, 0, target.word);

  const langName = targetLang === 'es' ? 'Spanish' : 'Italian';

  return {
    type: 'multiple_choice',
    id: `extra-mc-${target.id}`,
    question: `What is "${target.translation}" in ${langName}?`,
    options,
    correctIndex,
  };
}

function generateFillBlank(vocab: VocabularyItem): FillBlankExercise | null {
  if (!vocab.example || !vocab.word) return null;

  // Replace the target word in the example with a blank
  const sentence = vocab.example.replace(
    new RegExp(escapeRegExp(vocab.word), 'i'),
    '___'
  );

  // Only create exercise if we actually replaced something
  if (sentence === vocab.example) return null;

  return {
    type: 'fill_blank',
    id: `extra-fb-${vocab.id}`,
    sentence,
    answer: vocab.word,
    hint: vocab.translation,
  };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Clear cached exercises for a specific lesson.
 */
export async function clearExerciseCache(lessonId: string): Promise<void> {
  await AsyncStorage.removeItem(`${CACHE_PREFIX}${lessonId}`);
}
