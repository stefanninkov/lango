import { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../theme';
import type { Achievement } from '../types';

interface Props {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export default function AchievementPopup({ achievement, onDismiss }: Props) {
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (achievement) {
      translateY.value = withTiming(0, { duration: 400 });
      opacity.value = withTiming(1, { duration: 300 });

      // Auto-dismiss after 4 seconds
      const timeout = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timeout);
    } else {
      translateY.value = withTiming(-120, { duration: 300 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [achievement]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!achievement) return null;

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <Pressable style={styles.card} onPress={onDismiss}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={achievement.icon as any} size={28} color={colors.gold} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Achievement Unlocked!</Text>
          <Text style={styles.title}>{achievement.title}</Text>
          <Text style={styles.description}>{achievement.description}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 1000,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...typography.caption,
    color: colors.gold,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...typography.h3,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
