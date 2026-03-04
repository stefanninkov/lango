import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../src/theme';

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.title}>Review</Text>
      <View style={styles.placeholder}>
        <MaterialCommunityIcons name="cards-outline" size={80} color={colors.secondary} />
        <Text style={styles.heading}>Spaced Repetition Review</Text>
        <Text style={styles.description}>
          Review words you've learned using scientifically-proven spaced repetition.
          The app schedules reviews at optimal intervals for long-term memory.
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Coming in Phase 2</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xl,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingBottom: 100,
  },
  heading: {
    ...typography.h2,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  badge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  badgeText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '600',
  },
});
