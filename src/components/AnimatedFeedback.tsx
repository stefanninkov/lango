import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../theme';

interface Props {
  type: 'correct' | 'incorrect';
  visible: boolean;
  message?: string;
}

export default function AnimatedFeedback({ type, visible, message }: Props) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 150, easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: 100 })
      );
      opacity.value = withTiming(1, { duration: 150 });
    } else {
      scale.value = withTiming(0, { duration: 100 });
      opacity.value = withTiming(0, { duration: 100 });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const isCorrect = type === 'correct';

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: isCorrect ? 'rgba(0,217,166,0.15)' : 'rgba(255,107,138,0.15)' },
        { borderColor: isCorrect ? colors.secondary : colors.accent },
        animStyle,
      ]}
    >
      <MaterialCommunityIcons
        name={isCorrect ? 'check-circle' : 'close-circle'}
        size={24}
        color={isCorrect ? colors.secondary : colors.accent}
      />
      <Text style={[styles.text, { color: isCorrect ? colors.secondary : colors.accent }]}>
        {message ?? (isCorrect ? 'Correct!' : 'Not quite')}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  text: {
    ...typography.body,
    fontWeight: '600',
  },
});
