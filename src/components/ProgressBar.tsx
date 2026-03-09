import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, radius } from '../theme';

interface Props {
  progress: number; // 0-1
  height?: number;
  color?: string;
}

export default function ProgressBar({ progress, height = 6, color }: Props) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${Math.min(progress, 1) * 100}%`, { duration: 400 }),
  }));

  return (
    <View style={[styles.track, { height }]}>
      <Animated.View style={[styles.fill, { height }, color ? { backgroundColor: color } : undefined, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
});
