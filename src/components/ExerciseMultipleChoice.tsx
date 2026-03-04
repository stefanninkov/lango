import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { colors, spacing, typography, radius } from '../theme';
import type { MultipleChoiceExercise } from '../types';

interface Props {
  exercise: MultipleChoiceExercise;
  onComplete: (correct: boolean) => void;
}

export default function ExerciseMultipleChoice({ exercise, onComplete }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (index: number) => {
    if (submitted) return;
    setSelected(index);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
  };

  const handleNext = () => {
    onComplete(selected === exercise.correctIndex);
  };

  const getOptionStyle = (index: number) => {
    if (!submitted) {
      return index === selected ? styles.optionSelected : styles.option;
    }
    if (index === exercise.correctIndex) return styles.optionCorrect;
    if (index === selected && index !== exercise.correctIndex) return styles.optionIncorrect;
    return styles.option;
  };

  const getOptionTextColor = (index: number) => {
    if (!submitted && index === selected) return colors.primary;
    if (submitted && index === exercise.correctIndex) return colors.secondary;
    if (submitted && index === selected && index !== exercise.correctIndex) return colors.accent;
    return colors.textPrimary;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{exercise.question}</Text>

      <View style={styles.options}>
        {exercise.options.map((option, index) => (
          <Pressable
            key={index}
            style={getOptionStyle(index)}
            onPress={() => handleSelect(index)}
          >
            <Text style={[styles.optionText, { color: getOptionTextColor(index) }]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>

      {!submitted ? (
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={selected === null}
          buttonColor={colors.primary}
          textColor={colors.white}
          style={styles.button}
        >
          Check
        </Button>
      ) : (
        <Button
          mode="contained"
          onPress={handleNext}
          buttonColor={selected === exercise.correctIndex ? colors.secondary : colors.primary}
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
  question: {
    ...typography.h2,
    marginBottom: spacing.xl,
  },
  options: {
    gap: spacing.md,
    flex: 1,
  },
  option: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.md - 1,
  },
  optionCorrect: {
    backgroundColor: 'rgba(0, 217, 166, 0.1)',
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.secondary,
    padding: spacing.md - 1,
  },
  optionIncorrect: {
    backgroundColor: 'rgba(255, 107, 138, 0.1)',
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: spacing.md - 1,
  },
  optionText: {
    ...typography.body,
  },
  button: {
    height: 48,
    justifyContent: 'center',
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
});
