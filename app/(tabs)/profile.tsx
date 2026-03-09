import { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { useProgressStore } from '../../src/stores/progressStore';
import { useVocabularyStore } from '../../src/stores/vocabularyStore';
import { useGamificationStore } from '../../src/stores/gamificationStore';
import { signOut } from '../../src/services/authService';
import { getXPProgress } from '../../src/utils/gamification';
import { ACHIEVEMENTS } from '../../src/utils/gamification';
import { getCourseId } from '../../src/utils/content';
import ProgressBar from '../../src/components/ProgressBar';
import FadeInView from '../../src/components/FadeInView';
import CircularProgress from '../../src/components/CircularProgress';
import type { CourseId, Achievement } from '../../src/types';

const LANGUAGE_NAMES: Record<string, string> = {
  es: 'Spanish',
  it: 'Italian',
  en: 'English',
  sr: 'Serbian',
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, clearUser } = useAuthStore();
  const { progress, fetchProgress } = useProgressStore();
  const { cards, fetchCards, getStats: getVocabStats } = useVocabularyStore();
  const { unlockedAchievements, refreshAchievements } = useGamificationStore();

  const courseId = user ? getCourseId(user.nativeLanguage, user.targetLanguage) : 'en-es';

  useEffect(() => {
    if (user) {
      fetchProgress(user.uid, courseId as CourseId);
      fetchCards(user.uid, courseId as CourseId);
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
  }, [user?.xp, progress?.completedLessons.length, cards.length]);

  const handleSignOut = async () => {
    await signOut();
    clearUser();
  };

  const xpProgress = getXPProgress(user?.xp ?? 0);
  const vocabStats = getVocabStats();
  const completedCount = progress?.completedLessons.length ?? 0;
  const unlockedIds = new Set(unlockedAchievements.map((a) => a.id));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
    >
      <FadeInView delay={0}>
        <Text style={styles.title}>Profile</Text>
      </FadeInView>

      {/* User Info */}
      <FadeInView delay={60}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetter}>
            {(user?.displayName ?? 'U')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.displayName ?? 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.levelPill}>
          <MaterialCommunityIcons name="shield-star" size={14} color={colors.gold} />
          <Text style={styles.levelText}>Level {xpProgress.level}</Text>
        </View>
      </View>
      </FadeInView>

      {/* XP Progress */}
      <FadeInView delay={120}>
      <Card style={styles.card}>
        <Card.Content style={styles.xpContent}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpTitle}>Experience Points</Text>
            <Text style={styles.xpTotal}>{user?.xp ?? 0} XP</Text>
          </View>
          <ProgressBar progress={xpProgress.percent} color={colors.gold} height={8} />
          <Text style={styles.xpSubtext}>
            {xpProgress.current} / {xpProgress.needed} XP to Level {xpProgress.level + 1}
          </Text>
        </Card.Content>
      </Card>
      </FadeInView>

      {/* Stats Grid */}
      <FadeInView delay={180}>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="fire" size={24} color={colors.warning} />
          <Text style={styles.statValue}>{user?.streak ?? 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="check-circle" size={24} color={colors.secondary} />
          <Text style={styles.statValue}>{completedCount}</Text>
          <Text style={styles.statLabel}>Lessons</Text>
        </View>
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="cards" size={24} color={colors.primary} />
          <Text style={styles.statValue}>{vocabStats.total}</Text>
          <Text style={styles.statLabel}>Vocab Cards</Text>
        </View>
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="star" size={24} color={colors.gold} />
          <Text style={styles.statValue}>{vocabStats.mastered}</Text>
          <Text style={styles.statLabel}>Mastered</Text>
        </View>
      </View>
      </FadeInView>

      {/* Language */}
      <FadeInView delay={240}>
      <Card style={styles.card}>
        <Card.Content style={styles.langContent}>
          <MaterialCommunityIcons name="translate" size={24} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.langLabel}>Learning</Text>
            <Text style={styles.langValue}>
              {LANGUAGE_NAMES[user?.targetLanguage ?? 'es']} from{' '}
              {LANGUAGE_NAMES[user?.nativeLanguage ?? 'en']}
            </Text>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/settings' as any)}>
            <MaterialCommunityIcons name="cog" size={20} color={colors.textMuted} />
          </Pressable>
        </Card.Content>
      </Card>
      </FadeInView>

      {/* Achievements */}
      <FadeInView delay={300}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <Text style={styles.sectionCount}>
          {unlockedAchievements.length} / {ACHIEVEMENTS.length}
        </Text>
      </View>

      <View style={styles.achievementGrid}>
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = unlockedIds.has(achievement.id);
          return (
            <View
              key={achievement.id}
              style={[styles.achievementCard, !unlocked && styles.achievementLocked]}
            >
              <View style={[styles.achievementIcon, unlocked && styles.achievementIconUnlocked]}>
                <MaterialCommunityIcons
                  name={achievement.icon as any}
                  size={24}
                  color={unlocked ? colors.gold : colors.textMuted}
                />
              </View>
              <Text
                style={[styles.achievementTitle, !unlocked && styles.achievementTitleLocked]}
                numberOfLines={1}
              >
                {achievement.title}
              </Text>
              <Text style={styles.achievementDesc} numberOfLines={2}>
                {achievement.description}
              </Text>
            </View>
          );
        })}
      </View>
      </FadeInView>

      {/* Vocab Mastery Breakdown */}
      <FadeInView delay={360}>
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Vocabulary Mastery</Text>
      <Card style={styles.card}>
        <Card.Content style={styles.masteryContent}>
          <MasteryRow label="New" count={vocabStats.new} color={colors.textSecondary} total={vocabStats.total} />
          <MasteryRow label="Learning" count={vocabStats.learning} color={colors.warning} total={vocabStats.total} />
          <MasteryRow label="Reviewing" count={vocabStats.reviewing} color={colors.primary} total={vocabStats.total} />
          <MasteryRow label="Mastered" count={vocabStats.mastered} color={colors.secondary} total={vocabStats.total} />
        </Card.Content>
      </Card>
      </FadeInView>

      {/* Settings Button */}
      <FadeInView delay={420}>
      <Pressable style={styles.settingsRow} onPress={() => router.push('/(tabs)/settings' as any)}>
        <MaterialCommunityIcons name="cog-outline" size={22} color={colors.textSecondary} />
        <Text style={styles.settingsText}>Settings</Text>
        <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
      </Pressable>

      </FadeInView>

      {/* Sign Out */}
      <Button
        mode="outlined"
        onPress={handleSignOut}
        textColor={colors.accent}
        style={styles.signOutButton}
      >
        Sign Out
      </Button>
    </ScrollView>
  );
}

function MasteryRow({ label, count, color, total }: { label: string; count: number; color: string; total: number }) {
  const pct = total > 0 ? count / total : 0;
  return (
    <View style={styles.masteryRow}>
      <View style={[styles.masteryDot, { backgroundColor: color }]} />
      <Text style={styles.masteryLabel}>{label}</Text>
      <Text style={[styles.masteryCount, { color }]}>{count}</Text>
      <View style={styles.masteryBarTrack}>
        <View style={[styles.masteryBarFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
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
  title: {
    ...typography.h1,
    marginBottom: spacing.lg,
  },
  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  name: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  levelText: {
    ...typography.caption,
    color: colors.gold,
    fontWeight: '700',
  },
  // XP card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  xpContent: {
    gap: spacing.sm,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  xpTotal: {
    ...typography.body,
    color: colors.gold,
    fontWeight: '700',
  },
  xpSubtext: {
    ...typography.caption,
    color: colors.textMuted,
  },
  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
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
    textAlign: 'center',
    fontSize: 10,
  },
  // Language card
  langContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  langLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  langValue: {
    ...typography.body,
  },
  // Achievements section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  sectionCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  achievementCard: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementIconUnlocked: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  achievementTitle: {
    ...typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: colors.textMuted,
  },
  achievementDesc: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  // Mastery breakdown
  masteryContent: {
    gap: spacing.md,
  },
  masteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  masteryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  masteryLabel: {
    ...typography.bodySmall,
    width: 70,
  },
  masteryCount: {
    ...typography.body,
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  masteryBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  masteryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Settings row
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  settingsText: {
    ...typography.body,
    flex: 1,
  },
  // Sign out
  signOutButton: {
    borderColor: colors.accent,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
});
