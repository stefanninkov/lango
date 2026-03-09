import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../theme';
import type { VocabReviewCard, ReviewQuality } from '../types';

interface Props {
  card: VocabReviewCard;
  onRate: (quality: ReviewQuality) => void;
  index: string; // e.g. "3 of 12"
}

const QUALITY_BUTTONS: { quality: ReviewQuality; label: string; color: string; icon: string }[] = [
  { quality: 0, label: 'Forgot', color: colors.accent, icon: 'close-circle' },
  { quality: 3, label: 'Hard', color: colors.warning, icon: 'alert-circle' },
  { quality: 4, label: 'Good', color: colors.primary, icon: 'check-circle' },
  { quality: 5, label: 'Easy', color: colors.secondary, icon: 'star-circle' },
];

export default function ReviewCard({ card, onRate, index }: Props) {
  const [flipped, setFlipped] = useState(false);
  const rotation = useSharedValue(0);

  const toggleFlip = () => {
    const next = !flipped;
    setFlipped(next);
    rotation.value = withTiming(next ? 180 : 0, { duration: 300 });
  };

  const handleRate = (quality: ReviewQuality) => {
    setFlipped(false);
    rotation.value = 0;
    onRate(quality);
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [0, 180])}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));

  return (
    <View style={styles.wrapper}>
      <Text style={styles.index}>{index}</Text>

      <Pressable onPress={toggleFlip} style={styles.cardContainer}>
        <Animated.View style={[styles.card, frontStyle]}>
          <Text style={styles.word}>{card.word}</Text>
          <Text style={styles.pronunciation}>{card.pronunciation}</Text>
          <View style={styles.masteryBadge}>
            <Text style={styles.masteryText}>{card.mastery}</Text>
          </View>
          <Text style={styles.tapHint}>Tap to reveal</Text>
        </Animated.View>
        <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
          <Text style={styles.translation}>{card.translation}</Text>
          <View style={styles.divider} />
          <Text style={styles.wordSmall}>{card.word}</Text>
        </Animated.View>
      </Pressable>

      {flipped && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>How well did you remember?</Text>
          <View style={styles.ratingButtons}>
            {QUALITY_BUTTONS.map((btn) => (
              <Pressable
                key={btn.quality}
                style={[styles.rateButton, { borderColor: btn.color }]}
                onPress={() => handleRate(btn.quality)}
              >
                <MaterialCommunityIcons name={btn.icon as any} size={24} color={btn.color} />
                <Text style={[styles.rateLabel, { color: btn.color }]}>{btn.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {!flipped && (
        <View style={styles.hintRow}>
          <MaterialCommunityIcons name="gesture-tap" size={18} color={colors.textMuted} />
          <Text style={styles.hintText}>Tap card to reveal answer</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  index: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cardContainer: {
    width: '100%',
    height: 260,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardBack: {
    backgroundColor: colors.surface,
  },
  word: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  pronunciation: {
    ...typography.bodySmall,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  masteryBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  masteryText: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  tapHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  translation: {
    ...typography.h2,
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  wordSmall: {
    ...typography.body,
    color: colors.textSecondary,
  },
  ratingContainer: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  ratingLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rateButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  rateLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  hintText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
