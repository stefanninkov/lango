import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../../src/theme';
import { useAuthStore } from '../../../src/stores/authStore';
import { useProgressStore } from '../../../src/stores/progressStore';
import { getCourse, getCourseId } from '../../../src/utils/content';
import ProgressBar from '../../../src/components/ProgressBar';
import type { UnitMeta } from '../../../src/types';

export default function UnitListScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const progress = useProgressStore((s) => s.progress);

  const courseId = user ? getCourseId(user.nativeLanguage, user.targetLanguage) : 'en-es';
  const course = getCourse(courseId as any);

  const getUnitProgress = (unit: UnitMeta) => {
    if (!progress) return 0;
    const completed = unit.lessons.filter((l) =>
      progress.completedLessons.includes(l.id)
    ).length;
    return completed / unit.lessons.length;
  };

  const renderUnit = ({ item: unit }: { item: UnitMeta }) => (
    <Card
      style={styles.card}
      onPress={() => router.push(`/(tabs)/lessons/${unit.id}`)}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name="book-open-variant"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.unitOrder}>Unit {unit.order}</Text>
        </View>
        <Text style={styles.unitTitle}>{unit.title}</Text>
        <Text style={styles.unitDesc}>{unit.description}</Text>
        <View style={styles.progressRow}>
          <ProgressBar progress={getUnitProgress(unit)} />
          <Text style={styles.progressText}>
            {unit.lessons.filter((l) => progress?.completedLessons.includes(l.id)).length}/
            {unit.lessons.length} lessons
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <Text style={styles.title}>Lessons</Text>
      <Text style={styles.subtitle}>{course?.courseName ?? 'Language Course'}</Text>

      <FlatList
        data={course?.units ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderUnit}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  unitOrder: {
    ...typography.caption,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  unitTitle: {
    ...typography.h2,
  },
  unitDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  progressRow: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  progressText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
