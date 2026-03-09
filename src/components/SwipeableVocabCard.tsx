import { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../theme';
import type { VocabularyItem } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface Props {
  item: VocabularyItem;
  onNext: () => void;
  showIndex?: string; // e.g. "3 of 8"
}

export default function SwipeableVocabCard({ item, onNext, showIndex }: Props) {
  const [flipped, setFlipped] = useState(false);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const toggleFlip = () => {
    const newFlipped = !flipped;
    setFlipped(newFlipped);
    rotation.value = withTiming(newFlipped ? 180 : 0, { duration: 300 });
  };

  const animateOut = () => {
    translateX.value = withTiming(SCREEN_WIDTH + 50, { duration: 250 }, () => {
      runOnJS(resetAndNext)();
    });
    cardOpacity.value = withTiming(0, { duration: 250 });
  };

  const resetAndNext = () => {
    setFlipped(false);
    rotation.value = 0;
    translateX.value = 0;
    cardOpacity.value = 1;
    onNext();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow swiping right (forward)
      translateX.value = Math.max(0, e.translationX);
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(animateOut)();
      } else {
        translateX.value = withSpring(0, { damping: 15 });
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(toggleFlip)();
  });

  const gesture = Gesture.Race(panGesture, tapGesture);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [0, 180])}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));

  const cardContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: cardOpacity.value,
  }));

  return (
    <View style={styles.wrapper}>
      {showIndex && <Text style={styles.index}>{showIndex}</Text>}

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.container, cardContainerStyle]}>
          <Animated.View style={[styles.card, frontStyle]}>
            <Text style={styles.word}>{item.word}</Text>
            <Text style={styles.pronunciation}>{item.pronunciation}</Text>
            <Text style={styles.tapHint}>Tap to flip</Text>
          </Animated.View>
          <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
            <Text style={styles.translation}>{item.translation}</Text>
            <View style={styles.divider} />
            <Text style={styles.example}>{item.example}</Text>
            <Text style={styles.exampleTranslation}>{item.exampleTranslation}</Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      <View style={styles.swipeHint}>
        <MaterialCommunityIcons name="gesture-swipe-right" size={20} color={colors.textMuted} />
        <Text style={styles.swipeText}>Swipe right for next</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  index: {
    ...typography.caption,
    color: colors.textSecondary,
  },
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
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  swipeText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
