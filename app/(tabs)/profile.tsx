import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { signOut } from '../../src/services/authService';

const LANGUAGE_NAMES: Record<string, string> = {
  es: 'Spanish',
  it: 'Italian',
  en: 'English',
  sr: 'Serbian',
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, clearUser } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    clearUser();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.title}>Profile</Text>

      {/* User Info */}
      <View style={styles.avatar}>
        <MaterialCommunityIcons name="account-circle" size={80} color={colors.primary} />
      </View>
      <Text style={styles.name}>{user?.displayName ?? 'User'}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      {/* Language Pair */}
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <MaterialCommunityIcons name="translate" size={24} color={colors.primary} />
          <View style={styles.cardText}>
            <Text style={styles.cardLabel}>Learning</Text>
            <Text style={styles.cardValue}>
              {LANGUAGE_NAMES[user?.targetLanguage ?? 'es']} from{' '}
              {LANGUAGE_NAMES[user?.nativeLanguage ?? 'en']}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Stats */}
      <Card style={styles.card}>
        <Card.Content style={styles.statsContent}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="star-four-points" size={20} color={colors.gold} />
            <Text style={styles.statValue}>{user?.xp ?? 0}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="fire" size={20} color={colors.warning} />
            <Text style={styles.statValue}>{user?.streak ?? 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="school" size={20} color={colors.secondary} />
            <Text style={styles.statValue}>{user?.level ?? 'beginner'}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Sign Out */}
      <Button
        mode="outlined"
        onPress={handleSignOut}
        textColor={colors.accent}
        style={styles.signOutButton}
      >
        Sign Out
      </Button>
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
  avatar: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.bodySmall,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  cardValue: {
    ...typography.body,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    ...typography.h3,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    alignSelf: 'stretch',
  },
  signOutButton: {
    marginTop: 'auto',
    marginBottom: spacing.xl,
    borderColor: colors.accent,
    borderRadius: radius.md,
  },
});
