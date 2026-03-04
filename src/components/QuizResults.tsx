import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../theme';

interface Props {
  score: number;
  total: number;
  xpEarned: number;
  onComplete: () => void;
}

export default function QuizResults({ score, total, xpEarned, onComplete }: Props) {
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 60;

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={passed ? 'trophy' : 'refresh'}
        size={80}
        color={passed ? colors.gold : colors.warning}
        style={styles.icon}
      />

      <Text style={styles.title}>{passed ? 'Lesson Complete!' : 'Keep Practicing'}</Text>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreValue}>
          {score}/{total}
        </Text>
        <Text style={styles.scoreLabel}>correct answers</Text>
      </View>

      <Text style={[styles.percentage, { color: passed ? colors.secondary : colors.accent }]}>
        {percentage}%
      </Text>

      {passed && (
        <View style={styles.xpContainer}>
          <MaterialCommunityIcons name="star-four-points" size={20} color={colors.gold} />
          <Text style={styles.xpText}>+{xpEarned} XP</Text>
        </View>
      )}

      <Button
        mode="contained"
        onPress={onComplete}
        buttonColor={colors.primary}
        textColor={colors.white}
        style={styles.button}
      >
        {passed ? 'Continue' : 'Try Again'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xl,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scoreLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  percentage: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginBottom: spacing.xl,
  },
  xpText: {
    ...typography.h3,
    color: colors.gold,
  },
  button: {
    height: 48,
    justifyContent: 'center',
    borderRadius: radius.md,
    width: '100%',
  },
});
