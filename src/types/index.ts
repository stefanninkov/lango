// Language types
export type NativeLanguage = 'en' | 'sr';
export type TargetLanguage = 'es' | 'it';
export type CourseId = `${NativeLanguage}-${TargetLanguage}`;
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

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
  level: Level;
  requiredUnit?: string; // unit id that must be completed first (or skipped via placement)
  lessons: LessonMeta[];
}

// Placement Test
export interface PlacementQuestion {
  id: string;
  level: Level;
  skill: 'vocabulary' | 'grammar' | 'reading';
  question: string;
  options: string[];
  correctIndex: number;
}

export interface PlacementTest {
  courseId: CourseId;
  questions: PlacementQuestion[];
}

export interface PlacementResult {
  level: Level;
  score: number; // 0-100
  startUnit: string; // unit id to start from
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

// Spaced Repetition (SM-2)
export type Mastery = 'new' | 'learning' | 'reviewing' | 'mastered';

export interface VocabReviewCard {
  id: string; // vocabItem id
  word: string;
  translation: string;
  pronunciation: string;
  courseId: CourseId;
  lessonId: string;
  easeFactor: number; // starts at 2.5
  interval: number; // days until next review
  repetitions: number; // consecutive correct
  nextReview: number; // timestamp ms
  mastery: Mastery;
  lastReviewed: number; // timestamp ms
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;
// 0 = complete blackout, 5 = perfect recall

// Gamification
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // MaterialCommunityIcons name
  condition: AchievementCondition;
  unlockedAt?: number;
}

export type AchievementCondition =
  | { type: 'lessons_completed'; count: number }
  | { type: 'streak_days'; count: number }
  | { type: 'xp_earned'; amount: number }
  | { type: 'words_mastered'; count: number }
  | { type: 'quiz_perfect'; count: number };

export interface DailyGoal {
  lessonsTarget: number;
  reviewsTarget: number;
  lessonsCompleted: number;
  reviewsCompleted: number;
  date: string; // ISO date
}

// AI Conversation
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  correction?: string; // AI correction of user's message
}

export interface Conversation {
  id: string;
  topic: string;
  lessonId?: string;
  messages: ChatMessage[];
  createdAt: number;
}
