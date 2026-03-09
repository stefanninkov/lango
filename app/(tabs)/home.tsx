import { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { useProgressStore } from '../../src/stores/progressStore';
import { useVocabularyStore } from '../../src/stores/vocabularyStore';
import { useGamificationStore } from '../../src/stores/gamificationStore';
import { getCourseId } from '../../src/utils/content';
import { getXPProgress } from '../../src/utils/gamification';
import { getDailyGoalProgress } from '../../src/utils/gamification';
import ProgressBar from '../../src/components/ProgressBar';
import AchievementPopup from '../../src/components/AchievementPopup';
import type { CourseId } from '../../src/types';

const LANGUAGE_NAMES: Record<string, string> = {
  es: 'Spanish',
  it: 'Italian',
  en: 'English',
  sr: 'Serbian',
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

  useEffect(() => {
    if (user) {
      fetchProgress(user.uid, courseId as CourseId);
      fetchCards(user.uid, courseId as CourseId);
      resetDailyGoalIfNeeded();
    }
  }, [user?.uid, courseId]);

  // Refresh achievements when stats change
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

  return (
    <>
      <AchievementPopup achievement={newAchievement} onDismiss={dismissAchievement} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
      >
        {/* Greeting */}
        <Text style={styles.greeting}>
          Hello, {user?.displayName ?? 'Learner'}
        </Text>
        <Text style={styles.courseName}>
          Learning {LANGUAGE_NAMES[user?.targetLanguage ?? 'es']}
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="fire" size={28} color={colors.warning} />
            <Text style={styles.statValue}>{user?.streak ?? 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="star-four-points" size={28} color={colors.gold} />
            <Text style={styles.statValue}>{user?.xp ?? 0}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="check-circle" size={28} color={colors.secondary} />
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
        </View>

        {/* XP Level Progress */}
        <Card style={styles.levelCard}>
          <Card.Content style={styles.levelContent}>
            <View style={styles.levelHeader}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>{xpProgress.level}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.levelTitle}>Level {xpProgress.level}</Text>
                <Text style={styles.levelXP}>
                  {xpProgress.current} / {xpProgress.needed} XP
                </Text>
              </View>
              <MaterialCommunityIcons name="trophy-outline" size={20} color={colors.gold} />
              <Text style={styles.achievementCount}>
                {unlockedAchievements.length}
              </Text>
            </View>
            <ProgressBar progress={xpProgress.percent} color={colors.gold} />
          </Card.Content>
        </Card>

        {/* Daily Goal */}
        <Card style={styles.goalCard}>
          <Card.Content style={styles.goalContent}>
            <View style={styles.goalHeader}>
              <MaterialCommunityIcons name="target" size={20} color={colors.primary} />
              <Text style={styles.goalTitle}>Daily Goal</Text>
              <Text style={styles.goalPercent}>{Math.round(goalProgress * 100)}%</Text>
            </View>
            <ProgressBar progress={goalProgress} />
            <View style={styles.goalDetails}>
              <Text style={styles.goalDetail}>
                {dailyGoal.lessonsCompleted}/{dailyGoal.lessonsTarget} lessons
              </Text>
              <Text style={styles.goalDetail}>
                {dailyGoal.reviewsCompleted}/{dailyGoal.reviewsTarget} reviews
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Continue Learning Card */}
        <Card style={styles.continueCard}>
          <Card.Content style={styles.continueContent}>
            <View style={styles.continueHeader}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.continueLabel}>Continue Learning</Text>
            </View>
            <Text style={styles.continueTitle}>
              {progress?.currentUnit
                ? `Unit: ${progress.currentUnit}`
                : 'Start your first lesson'}
            </Text>
            <ProgressBar progress={completedCount / 3} />
            <Text style={styles.progressText}>
              {completedCount}/3 lessons completed
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push('/(tabs)/lessons')}
              buttonColor={colors.primary}
              textColor={colors.white}
              style={styles.continueButton}
            >
              {completedCount > 0 ? 'Continue' : 'Start Learning'}
            </Button>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <Card
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/lessons')}
          >
            <Card.Content style={styles.actionContent}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.actionLabel}>Lessons</Text>
            </Card.Content>
          </Card>
          <Card
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/practice')}
          >
            <Card.Content style={styles.actionContent}>
              <MaterialCommunityIcons name="chat" size={24} color={colors.primaryLight} />
              <Text style={styles.actionLabel}>Practice</Text>
            </Card.Content>
          </Card>
          <Card
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/review')}
          >
            <Card.Content style={styles.actionContent}>
              <MaterialCommunityIcons name="cards" size={24} color={colors.secondary} />
              <Text style={styles.actionLabel}>Review</Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  greeting: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  courseName: {
    ...typography.bodySmall,
    color: colors.primary,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  // Level card
  levelCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  levelContent: {
    gap: spacing.sm,
  },
  levelHeader: {
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
  levelTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  levelXP: {
    ...typography.caption,
    color: colors.textMuted,
  },
  achievementCount: {
    ...typography.body,
    color: colors.gold,
    fontWeight: '600',
  },
  // Daily goal card
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  goalContent: {
    gap: spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  goalTitle: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
  goalPercent: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  goalDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  goalDetail: {
    ...typography.caption,
    color: colors.textMuted,
  },
  // Continue card
  continueCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  continueContent: {
    gap: spacing.md,
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
  continueButton: {
    height: 48,
    justifyContent: 'center',
    borderRadius: radius.md,
  },
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
  },
  actionContent: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
