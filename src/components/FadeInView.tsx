import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface Props {
  delay?: number;
  duration?: number;
  from?: 'bottom' | 'left' | 'right';
  distance?: number;
  children: React.ReactNode;
  style?: any;
}

export default function FadeInView({
  delay = 0,
  duration = 400,
  from = 'bottom',
  distance = 20,
  children,
  style,
}: Props) {
  const opacity = useSharedValue(0);
  const translate = useSharedValue(distance);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    translate.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animStyle = useAnimatedStyle(() => {
    const transform =
      from === 'bottom'
        ? [{ translateY: translate.value }]
        : from === 'left'
          ? [{ translateX: -translate.value }]
          : [{ translateX: translate.value }];
    return { opacity: opacity.value, transform };
  });

  return (
    <Animated.View style={[style, animStyle]}>
      {children}
    </Animated.View>
  );
}
