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
  runOnJS,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface Props {
  amount: number;
  visible: boolean;
  onFinish?: () => void;
}

export default function XPGainAnimation({ amount, visible, onFinish }: Props) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (visible && amount > 0) {
      translateY.value = 0;
      opacity.value = 0;
      scale.value = 0.5;

      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(800, withTiming(0, { duration: 400 }))
      );
      translateY.value = withTiming(-60, { duration: 1400, easing: Easing.out(Easing.quad) });
      scale.value = withSequence(
        withTiming(1.3, { duration: 200, easing: Easing.out(Easing.back(3)) }),
        withTiming(1, { duration: 150 })
      );

      if (onFinish) {
        setTimeout(onFinish, 1500);
      }
    }
  }, [visible, amount]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible || amount <= 0) return null;

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <MaterialCommunityIcons name="star-four-points" size={20} color={colors.gold} />
      <Text style={styles.text}>+{amount} XP</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(13, 13, 18, 0.9)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.gold,
    zIndex: 100,
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gold,
  },
});
