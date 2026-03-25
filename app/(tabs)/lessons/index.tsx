import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, webStyles } from '../../../src/theme';
import { useAuthStore } from '../../../src/stores/authStore';
import { useProgressStore } from '../../../src/stores/progressStore';
import { getCourse, getCourseId } from '../../../src/utils/content';
import ProgressBar from '../../../src/components/ProgressBar';
import FadeInView from '../../../src/components/FadeInView';
import type { UnitMeta, Level } from '../../../src/types';

const UNIT_ICONS = [
  'book-open-variant', 'numeric', 'account-group',
  'food-fork-drink', 'map-marker', 'shopping',
  'briefcase', 'hospital-box', 'palette',
];

const LEVEL_COLORS: Record<Level, string> = {
  A1: colors.secondary,
  A2: '#4ECDC4',
  B1: colors.primary,
  B2: colors.primaryLight,
  C1: colors.warning,
  C2: colors.gold,
};

const LEVEL_LABELS: Record<Level, string> = {
  A1: 'A1 — Beginner',
  A2: 'A2 — Elementary',
  B1: 'B1 — Intermediate',
  B2: 'B2 — Upper Intermediate',
  C1: 'C1 — Advanced',
  C2: 'C2 — Mastery',
};

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

  const isUnitUnlocked = (_unit: UnitMeta, index: number) => {
    // First unit is always unlocked
    if (index === 0) return true;
    // Duolingo-style: must complete previous unit to unlock next
    const prevUnit = course?.units[index - 1];
    if (!prevUnit) return true;
    return getUnitProgress(prevUnit) >= 1;
  };

  // Track last level for section headers
  let lastLevel: Level | null = null;

  const renderUnit = ({ item: unit, index }: { item: UnitMeta; index: number }) => {
    const unitProgress = getUnitProgress(unit);
    const completedCount = unit.lessons.filter((l) => progress?.completedLessons.includes(l.id)).length;
    const isComplete = unitProgress >= 1;
    const unlocked = isUnitUnlocked(unit, index);
    const iconName = UNIT_ICONS[index % UNIT_ICONS.length];
    const levelColor = LEVEL_COLORS[unit.level];

    // Show level header when level changes
    const showLevelHeader = unit.level !== lastLevel;
    lastLevel = unit.level;

    return (
      <FadeInView delay={index * 80}>
        {showLevelHeader && (
          <View style={styles.levelHeader}>
            <View style={[styles.levelDot, { backgroundColor: levelColor }]} />
            <Text style={[styles.levelHeaderText, { color: levelColor }]}>
              {LEVEL_LABELS[unit.level]}
            </Text>
          </View>
        )}
        <Card
          style={[
            styles.card,
            isComplete && styles.cardComplete,
            !unlocked && styles.cardLocked,
            unlocked && webStyles.card,
          ]}
          onPress={unlocked ? () => router.push(`/(tabs)/lessons/${unit.id}`) : undefined}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={[
                styles.unitIconBg,
                isComplete && styles.unitIconBgComplete,
                !unlocked && styles.unitIconBgLocked,
              ]}>
                <MaterialCommunityIcons
                  name={!unlocked ? 'lock' : isComplete ? 'check' : iconName as any}
                  size={22}
                  color={!unlocked ? colors.textMuted : isComplete ? colors.secondary : levelColor}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.unitOrder}>Unit {unit.order}</Text>
                <Text style={[styles.unitTitle, !unlocked && styles.textLocked]}>
                  {unit.title}
                </Text>
              </View>
              {unlocked && (
                <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
              )}
            </View>
            <Text style={[styles.unitDesc, !unlocked && styles.textLocked]}>
              {unit.description}
            </Text>
            {unlocked && (
              <View style={styles.progressRow}>
                <ProgressBar
                  progress={unitProgress}
                  color={isComplete ? colors.secondary : levelColor}
                />
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
            )}
            {!unlocked && (
              <Text style={styles.lockedText}>Complete previous unit to unlock</Text>
            )}
          </Card.Content>
        </Card>
      </FadeInView>
    );
  };

  // Reset lastLevel before render
  lastLevel = null;

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
  // Level section header
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  levelHeaderText: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardComplete: {
    borderColor: 'rgba(0, 217, 166, 0.3)',
  },
  cardLocked: {
    opacity: 0.5,
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
  unitIconBgLocked: {
    backgroundColor: 'rgba(92, 92, 110, 0.12)',
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
  textLocked: {
    color: colors.textMuted,
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
  lockedText: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: 56,
    fontStyle: 'italic',
  },
});
