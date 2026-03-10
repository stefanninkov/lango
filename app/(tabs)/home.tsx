import { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { useProgressStore } from '../../src/stores/progressStore';
import { useVocabularyStore } from '../../src/stores/vocabularyStore';
import { useGamificationStore } from '../../src/stores/gamificationStore';
import { getCourseId, getCourse } from '../../src/utils/content';
import { getXPProgress, getDailyGoalProgress } from '../../src/utils/gamification';
import ProgressBar from '../../src/components/ProgressBar';
import CircularProgress from '../../src/components/CircularProgress';
import FadeInView from '../../src/components/FadeInView';
import AchievementPopup from '../../src/components/AchievementPopup';
import type { CourseId } from '../../src/types';

const LANGUAGE_NAMES: Record<string, string> = {
  es: 'Spanish',
  it: 'Italian',
  en: 'English',
  sr: 'Serbian',
};

const LANGUAGE_FLAGS: Record<string, string> = {
  es: '\u{1F1EA}\u{1F1F8}',
  it: '\u{1F1EE}\u{1F1F9}',
  en: '\u{1F1EC}\u{1F1E7}',
  sr: '\u{1F1F7}\u{1F1F8}',
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { progress, fetchProgress } = useProgressStore();
  const { cards, fetchCards, getStats: getVocabStats } = useVocabularyStore();
  const {
    unlockedAchievements,
    dailyGoal,
    newAchievement,
    refreshAchievements,
    resetDailyGoalIfNeeded,
    dismissAchievement,
  } = useGamificationStore();

  const courseId = user
    ? getCourseId(user.nativeLanguage, user.targetLanguage)
    : 'en-es';
  const course = getCourse(courseId as CourseId);

  useEffect(() => {
    if (user) {
      fetchProgress(user.uid, courseId as CourseId);
      fetchCards(user.uid, courseId as CourseId);
      resetDailyGoalIfNeeded();
    }
  }, [user?.uid, courseId]);

  useEffect(() => {
    if (!user || !progress) return;
    const vocabStats = getVocabStats();
    const perfectQuizzes = Object.values(progress.quizScores).filter((s) => s === 100).length;
    refreshAchievements({
      lessonsCompleted: progress.completedLessons.length,
      streak: user.streak,
      xp: user.xp,
      wordsMastered: vocabStats.mastered,
      perfectQuizzes,
    });
  }, [user?.xp, user?.streak, progress?.completedLessons.length, cards.length]);

  const completedCount = progress?.completedLessons.length ?? 0;
  const xpProgress = getXPProgress(user?.xp ?? 0);
  const goalProgress = getDailyGoalProgress(
    dailyGoal.lessonsCompleted,
    dailyGoal.reviewsCompleted,
    dailyGoal.lessonsTarget,
    dailyGoal.reviewsTarget
  );
  const goalPercent = Math.round(goalProgress * 100);

  return (
    <>
      <AchievementPopup achievement={newAchievement} onDismiss={dismissAchievement} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <FadeInView delay={0}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>
                Hello, {user?.displayName ?? 'Learner'}
              </Text>
              <View style={styles.langRow}>
                <Text style={styles.langFlag}>
                  {LANGUAGE_FLAGS[user?.targetLanguage ?? 'es']}
                </Text>
                <Text style={styles.courseName}>
                  Learning {LANGUAGE_NAMES[user?.targetLanguage ?? 'es']}
                </Text>
              </View>
            </View>
            <Pressable
              style={styles.streakBadge}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <MaterialCommunityIcons name="fire" size={20} color={colors.warning} />
              <Text style={styles.streakText}>{user?.streak ?? 0}</Text>
            </Pressable>
          </View>
        </FadeInView>

        {/* Daily Goal Ring + Stats */}
        <FadeInView delay={80}>
          <View style={styles.goalSection}>
            <CircularProgress
              progress={goalProgress}
              size={140}
              strokeWidth={10}
              color={goalPercent >= 100 ? colors.secondary : colors.primary}
              label={`${goalPercent}%`}
              sublabel="daily goal"
            />
            <View style={styles.goalStats}>
              <View style={styles.goalStatItem}>
                <View style={styles.goalStatIcon}>
                  <MaterialCommunityIcons name="book-open-variant" size={18} color={colors.primary} />
                </View>
                <Text style={styles.goalStatValue}>
                  {dailyGoal.lessonsCompleted}/{dailyGoal.lessonsTarget}
                </Text>
                <Text style={styles.goalStatLabel}>Lessons</Text>
              </View>
              <View style={styles.goalStatItem}>
                <View style={[styles.goalStatIcon, { backgroundColor: 'rgba(0, 217, 166, 0.12)' }]}>
                  <MaterialCommunityIcons name="cards" size={18} color={colors.secondary} />
                </View>
                <Text style={styles.goalStatValue}>
                  {dailyGoal.reviewsCompleted}/{dailyGoal.reviewsTarget}
                </Text>
                <Text style={styles.goalStatLabel}>Reviews</Text>
              </View>
              <View style={styles.goalStatItem}>
                <View style={[styles.goalStatIcon, { backgroundColor: 'rgba(255, 215, 0, 0.12)' }]}>
                  <MaterialCommunityIcons name="trophy" size={18} color={colors.gold} />
                </View>
                <Text style={styles.goalStatValue}>{unlockedAchievements.length}</Text>
                <Text style={styles.goalStatLabel}>Badges</Text>
              </View>
            </View>
          </View>
        </FadeInView>

        {/* XP Level Bar */}
        <FadeInView delay={160}>
          <View style={styles.xpCard}>
            <View style={styles.xpHeader}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>{xpProgress.level}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.xpTitle}>Level {xpProgress.level}</Text>
                <ProgressBar progress={xpProgress.percent} color={colors.gold} height={6} />
              </View>
              <Text style={styles.xpAmount}>{user?.xp ?? 0} XP</Text>
            </View>
          </View>
        </FadeInView>

        {/* Stats Row */}
        <FadeInView delay={240}>
          <View style={styles.statsRow}>
            <StatBox icon="star-four-points" iconColor={colors.gold} value={user?.xp ?? 0} label="Total XP" />
            <StatBox icon="check-circle" iconColor={colors.secondary} value={completedCount} label="Lessons" />
            <StatBox icon="cards" iconColor={colors.primary} value={getVocabStats().total} label="Words" />
          </View>
        </FadeInView>

        {/* Continue Learning */}
        <FadeInView delay={320}>
          <Pressable
            style={styles.continueCard}
            onPress={() => router.push('/(tabs)/lessons')}
          >
            <View style={styles.continueGlow} />
            <View style={styles.continueContent}>
              <View style={styles.continueHeader}>
                <MaterialCommunityIcons name="book-open-variant" size={20} color={colors.primary} />
                <Text style={styles.continueLabel}>Continue Learning</Text>
              </View>
              <Text style={styles.continueTitle}>
                {progress?.currentUnit
                  ? `Unit: ${progress.currentUnit}`
                  : 'Start your first lesson'}
              </Text>
              <ProgressBar progress={course ? completedCount / Math.max(1, course.units.reduce((sum: number, u: any) => sum + u.lessons.length, 0)) : 0} />
              <Text style={styles.progressText}>{completedCount} lessons completed</Text>
            </View>
            <View style={styles.continueArrow}>
              <MaterialCommunityIcons name="arrow-right" size={24} color={colors.primary} />
            </View>
          </Pressable>
        </FadeInView>

        {/* Quick Actions */}
        <FadeInView delay={400}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <ActionCard icon="book-open-variant" label="Lessons" color={colors.primary} onPress={() => router.push('/(tabs)/lessons')} />
            <ActionCard icon="chat" label="Practice" color={colors.primaryLight} onPress={() => router.push('/(tabs)/practice')} />
            <ActionCard icon="cards" label="Review" color={colors.secondary} onPress={() => router.push('/(tabs)/review')} />
          </View>
        </FadeInView>
      </ScrollView>
    </>
  );
}

function StatBox({ icon, iconColor, value, label }: { icon: string; iconColor: string; value: number; label: string }) {
  return (
    <View style={styles.statCard}>
      <MaterialCommunityIcons name={icon as any} size={22} color={iconColor} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionCard({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable style={styles.actionCard} onPress={onPress}>
      <View style={[styles.actionIconBg, { backgroundColor: `${color}15` }]}>
        <MaterialCommunityIcons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + 20,
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  langFlag: {
    fontSize: 16,
  },
  courseName: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 184, 77, 0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 77, 0.3)',
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.warning,
  },
  // Daily Goal
  goalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.lg,
  },
  goalStats: {
    flex: 1,
    gap: spacing.lg,
  },
  goalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  goalStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalStatValue: {
    ...typography.body,
    fontWeight: '700',
    flex: 1,
  },
  goalStatLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  // XP level
  xpCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  levelBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 2,
    borderColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gold,
  },
  xpTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  xpAmount: {
    ...typography.body,
    color: colors.gold,
    fontWeight: '700',
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  // Continue
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  continueGlow: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
  },
  continueContent: {
    flex: 1,
    gap: spacing.sm,
  },
  continueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  continueLabel: {
    ...typography.caption,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  continueTitle: {
    ...typography.h3,
  },
  progressText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  continueArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  // Quick actions
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
