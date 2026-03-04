import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { colors, spacing, typography, radius } from '../theme';
import type { QuizQuestion as QuizQuestionType } from '../types';

interface Props {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (correct: boolean) => void;
}

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
  };

  const getOptionStyle = (index: number) => {
    if (!submitted) {
      return index === selected ? styles.optionSelected : styles.option;
    }
    if (index === question.correctIndex) return styles.optionCorrect;
    if (index === selected && index !== question.correctIndex) return styles.optionIncorrect;
    return styles.option;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>
        Question {questionNumber} of {totalQuestions}
      </Text>
      <Text style={styles.question}>{question.question}</Text>

      <View style={styles.options}>
        {question.options.map((option, index) => (
          <Pressable
            key={index}
            style={getOptionStyle(index)}
            onPress={() => !submitted && setSelected(index)}
          >
            <Text
              style={[
                styles.optionText,
                submitted && index === question.correctIndex && { color: colors.secondary },
                submitted &&
                  index === selected &&
                  index !== question.correctIndex && { color: colors.accent },
              ]}
            >
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
          Answer
        </Button>
      ) : (
        <Button
          mode="contained"
          onPress={() => onAnswer(selected === question.correctIndex)}
          buttonColor={
            selected === question.correctIndex ? colors.secondary : colors.primary
          }
          textColor={colors.white}
          style={styles.button}
        >
          Next
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
  counter: {
    ...typography.caption,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
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
