// Language types
export type NativeLanguage = 'en' | 'sr';
export type TargetLanguage = 'es' | 'it';
export type CourseId = `${NativeLanguage}-${TargetLanguage}`;
export type Level = 'beginner' | 'intermediate' | 'advanced';

// User
export interface User {
  uid: string;
  email: string;
  displayName: string;
  nativeLanguage: NativeLanguage;
  targetLanguage: TargetLanguage;
  level: Level;
  xp: number;
  streak: number;
  lastActiveDate: string; // ISO date "2025-01-15"
  createdAt: number;
}

// Course & Unit metadata
export interface Course {
  courseId: CourseId;
  courseName: string;
  units: UnitMeta[];
}

export interface UnitMeta {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonMeta[];
}

export interface LessonMeta {
  id: string;
  title: string;
  order: number;
  wordCount: number;
}

// Full lesson content
export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  vocabulary: VocabularyItem[];
  grammar: GrammarNote;
  exercises: Exercise[];
  quiz: QuizQuestion[];
}

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
}

export interface GrammarNote {
  title: string;
  explanation: string;
  examples: { target: string; native: string }[];
}

// Exercise types
export type Exercise =
  | MultipleChoiceExercise
  | FillBlankExercise
  | MatchingExercise
  | TranslationExercise;

export interface MultipleChoiceExercise {
  type: 'multiple_choice';
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface FillBlankExercise {
  type: 'fill_blank';
  id: string;
  sentence: string;
  answer: string;
  acceptableAnswers?: string[];
  hint?: string;
}

export interface MatchingExercise {
  type: 'matching';
  id: string;
  pairs: { left: string; right: string }[];
}

export interface TranslationExercise {
  type: 'translation';
  id: string;
  sentence: string;
  answer: string;
  acceptableAnswers?: string[];
  direction: 'to_target' | 'to_native';
}

// Quiz
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

// Progress
export interface UserProgress {
  courseId: CourseId;
  completedLessons: string[];
  quizScores: Record<string, number>;
  currentUnit: string;
  currentLesson: string;
}
