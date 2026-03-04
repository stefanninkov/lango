import { StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../theme';

interface Props {
  title: string;
  wordCount: number;
  isCompleted: boolean;
  quizScore?: number;
  onPress: () => void;
}

export default function LessonCard({
  title,
  wordCount,
  isCompleted,
  quizScore,
  onPress,
}: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <MaterialCommunityIcons
        name={isCompleted ? 'check-circle' : 'circle-outline'}
        size={24}
        color={isCompleted ? colors.secondary : colors.textMuted}
      />
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.meta}>{wordCount} words</Text>
      {isCompleted && quizScore !== undefined && (
        <Text style={styles.score}>{quizScore}%</Text>
      )}
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  title: {
    ...typography.body,
    flex: 1,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  score: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '600',
  },
});
