import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import { colors, spacing, typography, radius } from '../theme';
import type { VocabularyItem } from '../types';

interface Props {
  item: VocabularyItem;
}

export default function VocabularyCard({ item }: Props) {
  const [flipped, setFlipped] = useState(false);
  const rotation = useSharedValue(0);

  const toggleFlip = () => {
    setFlipped(!flipped);
    rotation.value = withTiming(flipped ? 0 : 180, { duration: 300 });
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [0, 180])}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` }],
    backfaceVisibility: 'hidden',
  }));

  return (
    <Pressable onPress={toggleFlip} style={styles.container}>
      <Animated.View style={[styles.card, frontStyle]}>
        <Text style={styles.word}>{item.word}</Text>
        <Text style={styles.pronunciation}>{item.pronunciation}</Text>
        <Text style={styles.tapHint}>Tap to reveal translation</Text>
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
        <Text style={styles.translation}>{item.translation}</Text>
        <View style={styles.divider} />
        <Text style={styles.example}>{item.example}</Text>
        <Text style={styles.exampleTranslation}>{item.exampleTranslation}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 280,
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
  },
  cardBack: {
    backgroundColor: colors.surface,
  },
  word: {
    ...typography.target,
    fontSize: 28,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  pronunciation: {
    ...typography.bodySmall,
    color: colors.primary,
    marginBottom: spacing.lg,
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
  example: {
    ...typography.body,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  exampleTranslation: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
});
