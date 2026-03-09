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
import FadeInView from '../../../src/components/FadeInView';
import type { UnitMeta } from '../../../src/types';

const UNIT_ICONS = ['book-open-variant', 'food-fork-drink', 'account-group', 'map-marker', 'calendar-clock'];

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

  const renderUnit = ({ item: unit, index }: { item: UnitMeta; index: number }) => {
    const unitProgress = getUnitProgress(unit);
    const completedCount = unit.lessons.filter((l) => progress?.completedLessons.includes(l.id)).length;
    const isComplete = unitProgress >= 1;
    const iconName = UNIT_ICONS[index % UNIT_ICONS.length];

    return (
      <FadeInView delay={index * 100}>
        <Card
          style={[styles.card, isComplete && styles.cardComplete]}
          onPress={() => router.push(`/(tabs)/lessons/${unit.id}`)}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={[styles.unitIconBg, isComplete && styles.unitIconBgComplete]}>
                <MaterialCommunityIcons
                  name={isComplete ? 'check' : iconName as any}
                  size={22}
                  color={isComplete ? colors.secondary : colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.unitOrder}>Unit {unit.order}</Text>
                <Text style={styles.unitTitle}>{unit.title}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
            </View>
            <Text style={styles.unitDesc}>{unit.description}</Text>
            <View style={styles.progressRow}>
              <ProgressBar progress={unitProgress} color={isComplete ? colors.secondary : colors.primary} />
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  {completedCount}/{unit.lessons.length} lessons
                </Text>
                {isComplete && (
                  <View style={styles.completeBadge}>
                    <MaterialCommunityIcons name="check" size={10} color={colors.secondary} />
                    <Text style={styles.completeText}>Complete</Text>
                  </View>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      </FadeInView>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <FadeInView delay={0}>
        <Text style={styles.title}>Lessons</Text>
        <Text style={styles.subtitle}>{course?.courseName ?? 'Language Course'}</Text>
      </FadeInView>

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
  cardComplete: {
    borderColor: 'rgba(0, 217, 166, 0.3)',
  },
  cardContent: {
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  unitIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitIconBgComplete: {
    backgroundColor: 'rgba(0, 217, 166, 0.12)',
  },
  unitOrder: {
    ...typography.caption,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  unitTitle: {
    ...typography.h3,
  },
  unitDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: 56,
  },
  progressRow: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completeText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '600',
    fontSize: 10,
  },
});
