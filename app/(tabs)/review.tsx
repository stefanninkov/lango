import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { useVocabularyStore } from '../../src/stores/vocabularyStore';
import { getCourseId } from '../../src/utils/content';
import ReviewCard from '../../src/components/ReviewCard';
import type { ReviewQuality, Mastery } from '../../src/types';

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { cards, isLoading, fetchCards, getDueCards: getDue, getStats, reviewCard } = useVocabularyStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const courseId = user ? getCourseId(user.nativeLanguage, user.targetLanguage) : null;
  const dueCards = getDue();

  useEffect(() => {
    if (user && courseId) {
      fetchCards(user.uid, courseId);
    }
  }, [user, courseId]);

  const handleRate = useCallback(
    async (quality: ReviewQuality) => {
      if (!user || !courseId || !dueCards[currentIndex]) return;
      await reviewCard(user.uid, courseId, dueCards[currentIndex].id, quality);
      setReviewed((r) => r + 1);

      if (currentIndex + 1 >= dueCards.length) {
        setSessionComplete(true);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    },
    [user, courseId, dueCards, currentIndex, reviewCard]
  );

  const restartSession = () => {
    setCurrentIndex(0);
    setSessionComplete(false);
    setReviewed(0);
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top + spacing.lg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Empty state — no cards at all
  if (cards.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.title}>Review</Text>
        <View style={[styles.center, { flex: 1, paddingBottom: 100 }]}>
          <MaterialCommunityIcons name="cards-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyHeading}>No cards yet</Text>
          <Text style={styles.emptyDesc}>
            Complete lessons to add vocabulary to your review deck. Words from each lesson are automatically added for spaced repetition practice.
          </Text>
        </View>
      </View>
    );
  }

  // Session complete
  if (sessionComplete || dueCards.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.title}>Review</Text>
        <ScrollView contentContainerStyle={styles.completeContent}>
          <MaterialCommunityIcons name="check-circle" size={64} color={colors.secondary} />
          <Text style={styles.completeHeading}>
            {reviewed > 0 ? 'Session Complete!' : 'All Caught Up!'}
          </Text>
          {reviewed > 0 && (
            <Text style={styles.completeDesc}>
              You reviewed {reviewed} card{reviewed !== 1 ? 's' : ''}
            </Text>
          )}

          <View style={styles.statsGrid}>
            <StatBox label="New" count={stats.new} color={colors.textSecondary} icon="plus-circle" />
            <StatBox label="Learning" count={stats.learning} color={colors.warning} icon="school" />
            <StatBox label="Reviewing" count={stats.reviewing} color={colors.primary} icon="sync" />
            <StatBox label="Mastered" count={stats.mastered} color={colors.secondary} icon="star" />
          </View>

          <Text style={styles.totalText}>{stats.total} total cards in deck</Text>

          {reviewed > 0 && (
            <Pressable style={styles.restartButton} onPress={restartSession}>
              <Text style={styles.restartText}>Review Again</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    );
  }

  // Active review session
  const card = dueCards[currentIndex];
  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Review</Text>
        <View style={styles.progressPill}>
          <Text style={styles.progressText}>
            {dueCards.length} due
          </Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex) / dueCards.length) * 100}%` },
          ]}
        />
      </View>

      <ReviewCard
        card={card}
        onRate={handleRate}
        index={`${currentIndex + 1} of ${dueCards.length}`}
      />
    </View>
  );
}

function StatBox({ label, count, color, icon }: { label: string; count: number; color: string; icon: string }) {
  return (
    <View style={styles.statBox}>
      <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressPill: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  progressText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 2,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  // Empty state
  emptyHeading: {
    ...typography.h2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  // Session complete
  completeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingBottom: 80,
  },
  completeHeading: {
    ...typography.h2,
  },
  completeDesc: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
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
  statCount: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  totalText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  restartButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  restartText: {
    ...typography.button,
    color: colors.white,
  },
});
