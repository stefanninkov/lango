import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Switch, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { useGamificationStore } from '../../src/stores/gamificationStore';
import { updateUserProfile } from '../../src/services/authService';
import type { NativeLanguage, TargetLanguage } from '../../src/types';

const NATIVE_LANGUAGES: { id: NativeLanguage; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'sr', label: 'Serbian' },
];

const TARGET_LANGUAGES: { id: TargetLanguage; label: string }[] = [
  { id: 'es', label: 'Spanish' },
  { id: 'it', label: 'Italian' },
];

const DAILY_LESSON_OPTIONS = [1, 2, 3, 5];
const DAILY_REVIEW_OPTIONS = [5, 10, 15, 20];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuthStore();
  const { dailyGoal } = useGamificationStore();

  const [nativeLang, setNativeLang] = useState<NativeLanguage>(user?.nativeLanguage ?? 'en');
  const [targetLang, setTargetLang] = useState<TargetLanguage>(user?.targetLanguage ?? 'es');
  const [lessonsTarget, setLessonsTarget] = useState(dailyGoal.lessonsTarget);
  const [reviewsTarget, setReviewsTarget] = useState(dailyGoal.reviewsTarget);
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  const hasLanguageChange =
    nativeLang !== user?.nativeLanguage || targetLang !== user?.targetLanguage;

  const handleSaveLanguage = async () => {
    if (!user || !hasLanguageChange) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        nativeLanguage: nativeLang,
        targetLanguage: targetLang,
      });
      setUser({ ...user, nativeLanguage: nativeLang, targetLanguage: targetLang });
    } catch {
      // handle error silently
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Language Settings */}
      <Text style={styles.sectionTitle}>Language</Text>

      <Text style={styles.label}>I speak</Text>
      <View style={styles.optionRow}>
        {NATIVE_LANGUAGES.map((lang) => (
          <Pressable
            key={lang.id}
            style={[styles.optionChip, nativeLang === lang.id && styles.optionChipActive]}
            onPress={() => setNativeLang(lang.id)}
          >
            <Text
              style={[styles.optionText, nativeLang === lang.id && styles.optionTextActive]}
            >
              {lang.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>I want to learn</Text>
      <View style={styles.optionRow}>
        {TARGET_LANGUAGES.map((lang) => (
          <Pressable
            key={lang.id}
            style={[styles.optionChip, targetLang === lang.id && styles.optionChipActive]}
            onPress={() => setTargetLang(lang.id)}
          >
            <Text
              style={[styles.optionText, targetLang === lang.id && styles.optionTextActive]}
            >
              {lang.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {hasLanguageChange && (
        <Button
          mode="contained"
          onPress={handleSaveLanguage}
          loading={saving}
          buttonColor={colors.primary}
          textColor={colors.white}
          style={styles.saveBtn}
        >
          Save Language Change
        </Button>
      )}

      {/* Daily Goals */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Daily Goals</Text>

      <Text style={styles.label}>Lessons per day</Text>
      <View style={styles.optionRow}>
        {DAILY_LESSON_OPTIONS.map((n) => (
          <Pressable
            key={n}
            style={[styles.optionChip, lessonsTarget === n && styles.optionChipActive]}
            onPress={() => setLessonsTarget(n)}
          >
            <Text style={[styles.optionText, lessonsTarget === n && styles.optionTextActive]}>
              {n}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Reviews per day</Text>
      <View style={styles.optionRow}>
        {DAILY_REVIEW_OPTIONS.map((n) => (
          <Pressable
            key={n}
            style={[styles.optionChip, reviewsTarget === n && styles.optionChipActive]}
            onPress={() => setReviewsTarget(n)}
          >
            <Text style={[styles.optionText, reviewsTarget === n && styles.optionTextActive]}>
              {n}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Notifications */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Notifications</Text>
      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchLabel}>Daily Reminder</Text>
          <Text style={styles.switchDesc}>Get reminded to practice every day</Text>
        </View>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          color={colors.primary}
        />
      </View>

      {/* About */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>About</Text>
      <View style={styles.aboutCard}>
        <Text style={styles.aboutName}>Lango</Text>
        <Text style={styles.aboutVersion}>Version 1.0.0</Text>
        <Text style={styles.aboutDesc}>
          A premium language learning app for Spanish and Italian, built with React Native and Expo.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  backBtn: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h1,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: colors.primary,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  optionChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  optionChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
  },
  optionText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  saveBtn: {
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  switchLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  switchDesc: {
    ...typography.caption,
    color: colors.textMuted,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  aboutName: {
    ...typography.h2,
    color: colors.primary,
  },
  aboutVersion: {
    ...typography.caption,
    color: colors.textMuted,
  },
  aboutDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});
