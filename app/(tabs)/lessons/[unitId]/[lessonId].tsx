import { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../../../../src/theme';
import { useAuthStore } from '../../../../src/stores/authStore';
import { useProgressStore } from '../../../../src/stores/progressStore';
import { useVocabularyStore } from '../../../../src/stores/vocabularyStore';
import { useGamificationStore } from '../../../../src/stores/gamificationStore';
import { getLesson, getCourseId } from '../../../../src/utils/content';
import { addXP, updateStreak } from '../../../../src/services/progressService';
import ProgressBar from '../../../../src/components/ProgressBar';
import SwipeableVocabCard from '../../../../src/components/SwipeableVocabCard';
import XPGainAnimation from '../../../../src/components/XPGainAnimation';
import ExerciseMultipleChoice from '../../../../src/components/ExerciseMultipleChoice';
import ExerciseFillBlank from '../../../../src/components/ExerciseFillBlank';
import ExerciseMatching from '../../../../src/components/ExerciseMatching';
import QuizQuestion from '../../../../src/components/QuizQuestion';
import QuizResults from '../../../../src/components/QuizResults';
import type { Exercise } from '../../../../src/types';

type Phase = 'vocabulary' | 'grammar' | 'exercises' | 'quiz' | 'results';

export default function LessonPlayerScreen() {
  const insets = useSafeAreaInsets();
  const { lessonId, unitId } = useLocalSearchParams<{ lessonId: string; unitId: string }>();
  const user = useAuthStore((s) => s.user);
  const { markLessonComplete } = useProgressStore();
  const { addLessonVocab } = useVocabularyStore();
  const { incrementLessons, resetDailyGoalIfNeeded } = useGamificationStore();

  const courseId = user
    ? getCourseId(user.nativeLanguage, user.targetLanguage)
    : ('en-es' as const);
  const lesson = getLesson(courseId as any, unitId ?? 'unit-1', lessonId ?? 'lesson-1');

  const [phase, setPhase] = useState<Phase>('vocabulary');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [exerciseCorrect, setExerciseCorrect] = useState(0);
  const [showXPGain, setShowXPGain] = useState(false);

  const phases: Phase[] = ['vocabulary', 'grammar', 'exercises', 'quiz', 'results'];
  const phaseIndex = phases.indexOf(phase);

  const totalSteps = useMemo(() => {
    if (!lesson) return 1;
    return (
      lesson.vocabulary.length +
      1 + // grammar
      lesson.exercises.length +
      lesson.quiz.length +
      1 // results
    );
  }, [lesson]);

  const currentStep = useMemo(() => {
    if (!lesson) return 0;
    switch (phase) {
      case 'vocabulary':
        return vocabIndex;
      case 'grammar':
        return lesson.vocabulary.length;
      case 'exercises':
        return lesson.vocabulary.length + 1 + exerciseIndex;
      case 'quiz':
        return lesson.vocabulary.length + 1 + lesson.exercises.length + quizIndex;
      case 'results':
        return totalSteps;
      default:
        return 0;
    }
  }, [phase, vocabIndex, exerciseIndex, quizIndex, lesson, totalSteps]);

  if (!lesson) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={typography.body}>Lesson not found</Text>
      </View>
    );
  }

  const handleVocabNext = () => {
    if (vocabIndex < lesson.vocabulary.length - 1) {
      setVocabIndex(vocabIndex + 1);
    } else {
      setPhase('grammar');
    }
  };

  const handleGrammarNext = () => {
    setPhase('exercises');
  };

  const handleExerciseComplete = (correct: boolean) => {
    if (correct) setExerciseCorrect((c) => c + 1);
    if (exerciseIndex < lesson.exercises.length - 1) {
      setExerciseIndex(exerciseIndex + 1);
    } else {
      setPhase('quiz');
    }
  };

  const handleQuizAnswer = (correct: boolean) => {
    if (correct) setQuizCorrect((c) => c + 1);
    if (quizIndex < lesson.quiz.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      setPhase('results');
    }
  };

  const handleComplete = async () => {
    if (!user || !lessonId) return;
    const score = Math.round((quizCorrect / lesson.quiz.length) * 100);
    const xp = score >= 60 ? 20 : 5;
    try {
      await markLessonComplete(user.uid, courseId as any, lessonId, score);
      await addXP(user.uid, xp);
      await updateStreak(user.uid);
      // Add lesson vocabulary to spaced repetition deck
      await addLessonVocab(user.uid, courseId as any, lessonId, lesson.vocabulary);
      // Update daily goal tracking
      resetDailyGoalIfNeeded();
      incrementLessons();
    } catch (e) {
      // Progress will sync later
    }
    router.back();
  };

  const renderExercise = (exercise: Exercise) => {
    switch (exercise.type) {
      case 'multiple_choice':
        return (
          <ExerciseMultipleChoice
            key={exercise.id}
            exercise={exercise}
            onComplete={handleExerciseComplete}
          />
        );
      case 'fill_blank':
        return (
          <ExerciseFillBlank
            key={exercise.id}
            exercise={exercise}
            onComplete={handleExerciseComplete}
          />
        );
      case 'matching':
        return (
          <ExerciseMatching
            key={exercise.id}
            exercise={exercise}
            onComplete={handleExerciseComplete}
          />
        );
      case 'translation':
        // Render translation as fill-blank for simplicity
        return (
          <ExerciseFillBlank
            key={exercise.id}
            exercise={{
              type: 'fill_blank',
              id: exercise.id,
              sentence: `Translate: "${exercise.sentence}"`,
              answer: exercise.answer,
              acceptableAnswers: exercise.acceptableAnswers,
            }}
            onComplete={handleExerciseComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="close"
          iconColor={colors.textSecondary}
          size={24}
          onPress={() => router.back()}
        />
        <View style={styles.progressContainer}>
          <ProgressBar progress={currentStep / totalSteps} />
        </View>
        <Text style={styles.phaseLabel}>
          {phase === 'vocabulary' && 'Vocabulary'}
          {phase === 'grammar' && 'Grammar'}
          {phase === 'exercises' && 'Practice'}
          {phase === 'quiz' && 'Quiz'}
          {phase === 'results' && 'Complete'}
        </Text>
      </View>

      {/* Vocabulary Phase */}
      {phase === 'vocabulary' && (
        <View style={styles.phaseContainer}>
          <SwipeableVocabCard
            item={lesson.vocabulary[vocabIndex]}
            onNext={handleVocabNext}
            showIndex={`${vocabIndex + 1} of ${lesson.vocabulary.length}`}
          />
        </View>
      )}

      {/* Grammar Phase */}
      {phase === 'grammar' && (
        <ScrollView style={styles.scrollPhase} contentContainerStyle={styles.grammarContent}>
          <Text style={styles.grammarTitle}>{lesson.grammar.title}</Text>
          <Text style={styles.grammarExplanation}>{lesson.grammar.explanation}</Text>
          <View style={styles.examplesContainer}>
            {lesson.grammar.examples.map((ex, i) => (
              <View key={i} style={styles.exampleRow}>
                <Text style={styles.exampleTarget}>{ex.target}</Text>
                <Text style={styles.exampleNative}>{ex.native}</Text>
              </View>
            ))}
          </View>
          <IconButton
            icon="arrow-right"
            mode="contained"
            iconColor={colors.white}
            containerColor={colors.primary}
            size={24}
            onPress={handleGrammarNext}
            style={styles.nextButton}
          />
        </ScrollView>
      )}

      {/* Exercise Phase */}
      {phase === 'exercises' && lesson.exercises[exerciseIndex] && (
        renderExercise(lesson.exercises[exerciseIndex])
      )}

      {/* Quiz Phase */}
      {phase === 'quiz' && lesson.quiz[quizIndex] && (
        <QuizQuestion
          question={lesson.quiz[quizIndex]}
          questionNumber={quizIndex + 1}
          totalQuestions={lesson.quiz.length}
          onAnswer={handleQuizAnswer}
        />
      )}

      {/* Results Phase */}
      {phase === 'results' && (
        <>
          <QuizResults
            score={quizCorrect}
            total={lesson.quiz.length}
            xpEarned={quizCorrect / lesson.quiz.length >= 0.6 ? 20 : 5}
            onComplete={handleComplete}
          />
          <XPGainAnimation
            amount={quizCorrect / lesson.quiz.length >= 0.6 ? 20 : 5}
            visible={phase === 'results'}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.lg,
    gap: spacing.sm,
  },
  progressContainer: {
    flex: 1,
  },
  phaseLabel: {
    ...typography.caption,
    color: colors.primary,
    width: 70,
    textAlign: 'right',
  },
  phaseContainer: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  nextButton: {
    alignSelf: 'center',
    marginTop: spacing.lg,
  },
  scrollPhase: {
    flex: 1,
  },
  grammarContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  grammarTitle: {
    ...typography.h2,
    color: colors.primary,
  },
  grammarExplanation: {
    ...typography.body,
    lineHeight: 24,
  },
  examplesContainer: {
    gap: spacing.md,
  },
  exampleRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: spacing.md,
    gap: spacing.xs,
  },
  exampleTarget: {
    ...typography.target,
  },
  exampleNative: {
    ...typography.native,
  },
});
