import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { colors, spacing, typography, radius } from '../theme';
import type { MatchingExercise } from '../types';

interface Props {
  exercise: MatchingExercise;
  onComplete: (correct: boolean) => void;
}

export default function ExerciseMatching({ exercise, onComplete }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // Shuffle right side on first render
  const [shuffledRight] = useState(() => {
    const indices = exercise.pairs.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });

  const handleLeftPress = (index: number) => {
    if (submitted || matches[index] !== undefined) return;
    setSelectedLeft(index);
  };

  const handleRightPress = (shuffledIndex: number) => {
    if (submitted || selectedLeft === null) return;
    const rightOriginalIndex = shuffledRight[shuffledIndex];
    // Check if this right item is already matched
    if (Object.values(matches).includes(rightOriginalIndex)) return;
    setMatches((prev) => ({ ...prev, [selectedLeft]: rightOriginalIndex }));
    setSelectedLeft(null);
  };

  const allMatched = Object.keys(matches).length === exercise.pairs.length;

  const handleCheck = () => {
    setSubmitted(true);
  };

  const isMatchCorrect = (leftIndex: number) => {
    return matches[leftIndex] === leftIndex;
  };

  const allCorrect = exercise.pairs.every((_, i) => matches[i] === i);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Match the pairs:</Text>

      <View style={styles.columns}>
        <View style={styles.column}>
          {exercise.pairs.map((pair, i) => (
            <Pressable
              key={`left-${i}`}
              style={[
                styles.item,
                selectedLeft === i && styles.itemSelected,
                matches[i] !== undefined && !submitted && styles.itemMatched,
                submitted && isMatchCorrect(i) && styles.itemCorrect,
                submitted && !isMatchCorrect(i) && styles.itemIncorrect,
              ]}
              onPress={() => handleLeftPress(i)}
            >
              <Text style={styles.itemText}>{pair.left}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.column}>
          {shuffledRight.map((originalIndex, shuffledIdx) => {
            const isUsed = Object.values(matches).includes(originalIndex);
            return (
              <Pressable
                key={`right-${shuffledIdx}`}
                style={[
                  styles.item,
                  isUsed && !submitted && styles.itemMatched,
                  submitted && styles.item,
                ]}
                onPress={() => handleRightPress(shuffledIdx)}
              >
                <Text style={styles.itemText}>
                  {exercise.pairs[originalIndex].right}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {!submitted ? (
        <Button
          mode="contained"
          onPress={handleCheck}
          disabled={!allMatched}
          buttonColor={colors.primary}
          textColor={colors.white}
          style={styles.button}
        >
          Check
        </Button>
      ) : (
        <Button
          mode="contained"
          onPress={() => onComplete(allCorrect)}
          buttonColor={allCorrect ? colors.secondary : colors.primary}
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
    marginBottom: spacing.lg,
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  column: {
    flex: 1,
    gap: spacing.sm,
  },
  item: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  itemSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    padding: spacing.md - 1,
  },
  itemMatched: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.primaryLight,
  },
  itemCorrect: {
    backgroundColor: 'rgba(0, 217, 166, 0.1)',
    borderColor: colors.secondary,
  },
  itemIncorrect: {
    backgroundColor: 'rgba(255, 107, 138, 0.1)',
    borderColor: colors.accent,
  },
  itemText: {
    ...typography.body,
    textAlign: 'center',
  },
  button: {
    height: 48,
    justifyContent: 'center',
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
});
