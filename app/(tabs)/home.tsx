import { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { useProgressStore } from '../../src/stores/progressStore';
import { getCourseId } from '../../src/utils/content';
import ProgressBar from '../../src/components/ProgressBar';
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

  const courseId = user
    ? getCourseId(user.nativeLanguage, user.targetLanguage)
    : 'en-es';

  useEffect(() => {
    if (user) {
      fetchProgress(user.uid, courseId as CourseId);
    }
  }, [user?.uid, courseId]);

  const completedCount = progress?.completedLessons.length ?? 0;

  return (
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
    marginBottom: spacing.xl,
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
