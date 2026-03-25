import { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, IconButton, Portal, Dialog, Paragraph, Button } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../../../../src/theme';
import { useAuthStore } from '../../../../src/stores/authStore';
import { useProgressStore } from '../../../../src/stores/progressStore';
import { useVocabularyStore } from '../../../../src/stores/vocabularyStore';
import { useGamificationStore } from '../../../../src/stores/gamificationStore';
import { getLesson, getCourseId } from '../../../../src/utils/content';
import { addXP, updateStreak } from '../../../../src/services/progressService';
import { scheduleStreakReminder, scheduleReviewReminder, getPermissionStatus } from '../../../../src/services/notificationService';
import ProgressBar from '../../../../src/components/ProgressBar';
import SwipeableVocabCard from '../../../../src/components/SwipeableVocabCard';
import XPGainAnimation from '../../../../src/components/XPGainAnimation';
import ExerciseMultipleChoice from '../../../../src/components/ExerciseMultipleChoice';
import ExerciseFillBlank from '../../../../src/components/ExerciseFillBlank';
import ExerciseMatching from '../../../../src/components/ExerciseMatching';
import QuizQuestion from '../../../../src/components/QuizQuestion';
import QuizResults from '../../../../src/components/QuizResults';
import { generateExercises } from '../../../../src/services/exerciseGenerator';
import type { Exercise } from '../../../../src/types';

type Phase = 'vocabulary' | 'grammar' | 'exercises' | 'quiz' | 'results' | 'extra_practice';

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
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [extraExercises, setExtraExercises] = useState<Exercise[]>([]);
  const [extraExerciseIndex, setExtraExerciseIndex] = useState(0);

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

  const handleClose = () => {
    if (phase === 'results' || phase === 'vocabulary') {
      router.back();
    } else {
      setShowCloseDialog(true);
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

      // Schedule notifications if permissions granted
      if (Platform.OS !== 'web') {
        const hasPermission = await getPermissionStatus();
        if (hasPermission) {
          scheduleStreakReminder(user.streak ?? 1).catch(() => {});
          const dueCount = useVocabularyStore.getState().getDueCards().length;
          if (dueCount > 0) {
            scheduleReviewReminder(dueCount).catch(() => {});
          }
        }
      }
    } catch (e) {
      // Progress will sync later
    }
    router.back();
  };

  const handlePracticeMore = async () => {
    if (!lesson) return;
    const targetLang = user?.targetLanguage ?? 'es';
    const exercises = await generateExercises(lessonId ?? 'lesson-1', lesson.vocabulary, targetLang);
    setExtraExercises(exercises);
    setExtraExerciseIndex(0);
    setPhase('extra_practice');
  };

  const handleExtraExerciseComplete = (_correct: boolean) => {
    if (extraExerciseIndex < extraExercises.length - 1) {
      setExtraExerciseIndex(extraExerciseIndex + 1);
    } else {
      // Return to results when extra practice is done
      setPhase('results');
    }
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
          onPress={handleClose}
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
            onPracticeMore={handlePracticeMore}
          />
          <XPGainAnimation
            amount={quizCorrect / lesson.quiz.length >= 0.6 ? 20 : 5}
            visible={phase === 'results'}
          />
        </>
      )}

      {/* Extra Practice Phase */}
      {phase === 'extra_practice' && extraExercises[extraExerciseIndex] && (
        (() => {
          const exercise = extraExercises[extraExerciseIndex];
          switch (exercise.type) {
            case 'multiple_choice':
              return (
                <ExerciseMultipleChoice
                  key={exercise.id}
                  exercise={exercise}
                  onComplete={handleExtraExerciseComplete}
                />
              );
            case 'fill_blank':
              return (
                <ExerciseFillBlank
                  key={exercise.id}
                  exercise={exercise}
                  onComplete={handleExtraExerciseComplete}
                />
              );
            case 'matching':
              return (
                <ExerciseMatching
                  key={exercise.id}
                  exercise={exercise}
                  onComplete={handleExtraExerciseComplete}
                />
              );
            default:
              return null;
          }
        })()
      )}

      <Portal>
        <Dialog
          visible={showCloseDialog}
          onDismiss={() => setShowCloseDialog(false)}
          style={{ backgroundColor: colors.surface }}
        >
          <Dialog.Title style={{ color: colors.textPrimary }}>Leave Lesson?</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ color: colors.textSecondary }}>
              Your progress in this lesson will be lost. Are you sure you want to leave?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCloseDialog(false)} textColor={colors.textSecondary}>
              Continue Lesson
            </Button>
            <Button onPress={() => router.back()} textColor={colors.accent}>
              Leave
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
