import { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  ViewToken,
} from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../src/theme';
import { setHasSeenWelcome } from '../../src/services/storageService';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: 'translate',
    title: 'Learn at Your Pace',
    subtitle:
      'Structured lessons in Spanish and Italian — from greetings to culture, with vocabulary, grammar, and exercises.',
    color: colors.primary,
  },
  {
    id: '2',
    icon: 'brain',
    title: 'AI Conversation Practice',
    subtitle:
      'Chat with an AI tutor that corrects your grammar, teaches new vocabulary, and adapts to your level.',
    color: colors.secondary,
  },
  {
    id: '3',
    icon: 'cards-outline',
    title: 'Smart Review',
    subtitle:
      'Spaced repetition flashcards ensure you remember what you learn. Words come back right when you need to review them.',
    color: colors.warning,
  },
  {
    id: '4',
    icon: 'trophy',
    title: 'Track Your Progress',
    subtitle:
      'Earn XP, unlock achievements, and build streaks. Set daily goals and watch your skills grow.',
    color: colors.gold,
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const isLast = activeIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleGetStarted();
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  };

  const handleGetStarted = async () => {
    await setHasSeenWelcome();
    router.replace('/(auth)/login');
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <View style={[styles.iconCircle, { backgroundColor: item.color + '1A' }]}>
        <MaterialCommunityIcons
          name={item.icon as any}
          size={64}
          color={item.color}
        />
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>Lango</Text>
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Dots + Buttons */}
      <View style={styles.footer}>
        {/* Page indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Action button */}
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isLast ? 'Get Started' : 'Next'}
          </Text>
          <MaterialCommunityIcons
            name={isLast ? 'arrow-right' : 'chevron-right'}
            size={20}
            color={colors.white}
          />
        </Pressable>

        {/* Skip link (hidden on last slide) */}
        {!isLast && (
          <Pressable style={styles.skipButton} onPress={handleGetStarted}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  logo: {
    ...typography.h1,
    fontSize: 36,
    color: colors.primary,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  slideTitle: {
    ...typography.h1,
    textAlign: 'center',
  },
  slideSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceElevated,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    width: '100%',
    gap: spacing.sm,
  },
  nextButtonText: {
    ...typography.button,
    color: colors.white,
  },
  skipButton: {
    paddingVertical: spacing.sm,
  },
  skipText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
