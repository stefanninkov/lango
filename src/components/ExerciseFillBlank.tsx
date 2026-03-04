import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { colors, spacing, typography, radius } from '../theme';
import type { FillBlankExercise } from '../types';

interface Props {
  exercise: FillBlankExercise;
  onComplete: (correct: boolean) => void;
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function ExerciseFillBlank({ exercise, onComplete }: Props) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = () => {
    const acceptable = exercise.acceptableAnswers ?? [exercise.answer];
    const correct = acceptable.some(
      (a) => normalize(a) === normalize(answer)
    );
    setIsCorrect(correct);
    setSubmitted(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Fill in the blank:</Text>
      <Text style={styles.sentence}>{exercise.sentence}</Text>

      <TextInput
        value={answer}
        onChangeText={setAnswer}
        placeholder="Type your answer..."
        mode="outlined"
        style={styles.input}
        outlineColor={
          submitted
            ? isCorrect
              ? colors.secondary
              : colors.accent
            : colors.border
        }
        activeOutlineColor={colors.primary}
        textColor={colors.textPrimary}
        editable={!submitted}
        theme={{ colors: { onSurfaceVariant: colors.textMuted } }}
      />

      {submitted && !isCorrect && (
        <Text style={styles.correctAnswer}>
          Correct answer: <Text style={styles.correctText}>{exercise.answer}</Text>
        </Text>
      )}

      {submitted && isCorrect && (
        <Text style={styles.correctFeedback}>Correct!</Text>
      )}

      {!submitted && exercise.hint && (
        <Button
          mode="text"
          onPress={() => setShowHint(true)}
          textColor={colors.warning}
          compact
        >
          {showHint ? `Hint: ${exercise.hint}` : 'Show hint'}
        </Button>
      )}

      {!submitted ? (
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!answer.trim()}
          buttonColor={colors.primary}
          textColor={colors.white}
          style={styles.button}
        >
          Check
        </Button>
      ) : (
        <Button
          mode="contained"
          onPress={() => onComplete(isCorrect)}
          buttonColor={isCorrect ? colors.secondary : colors.primary}
          textColor={colors.white}
          style={styles.button}
        >
          Continue
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sentence: {
    ...typography.h2,
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  correctAnswer: {
    ...typography.body,
    color: colors.accent,
    marginBottom: spacing.md,
  },
  correctText: {
    fontWeight: '600',
    color: colors.secondary,
  },
  correctFeedback: {
    ...typography.body,
    color: colors.secondary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  button: {
    height: 48,
    justifyContent: 'center',
    borderRadius: radius.md,
    marginTop: 'auto',
  },
});
