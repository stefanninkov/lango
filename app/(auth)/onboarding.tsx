import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { updateUserProfile } from '../../src/services/authService';
import type { NativeLanguage, TargetLanguage, Level } from '../../src/types';

type Step = 'native' | 'target' | 'level';

const NATIVE_LANGUAGES: { id: NativeLanguage; label: string; flag: string }[] = [
  { id: 'en', label: 'English', flag: 'EN' },
  { id: 'sr', label: 'Serbian', flag: 'SR' },
];

const TARGET_LANGUAGES: { id: TargetLanguage; label: string; flag: string }[] = [
  { id: 'es', label: 'Spanish', flag: 'ES' },
  { id: 'it', label: 'Italian', flag: 'IT' },
];

const LEVELS: { id: Level; label: string; description: string }[] = [
  { id: 'beginner', label: 'Beginner', description: 'Starting from scratch' },
  { id: 'intermediate', label: 'Intermediate', description: 'Know some basics' },
  { id: 'advanced', label: 'Advanced', description: 'Want to polish skills' },
];

export default function OnboardingScreen() {
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState<Step>('native');
  const [nativeLang, setNativeLang] = useState<NativeLanguage | null>(null);
  const [targetLang, setTargetLang] = useState<TargetLanguage | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!user || !nativeLang || !targetLang || !level) return;
    setLoading(true);
    try {
      await updateUserProfile(user.uid, {
        nativeLanguage: nativeLang,
        targetLanguage: targetLang,
        level,
      });
      setUser({
        ...user,
        nativeLanguage: nativeLang,
        targetLanguage: targetLang,
        level,
      });
    } catch (e) {
      // Profile will be updated on next login
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 'native' && nativeLang) setStep('target');
    else if (step === 'target' && targetLang) setStep('level');
    else if (step === 'level' && level) handleComplete();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>
          Step {step === 'native' ? '1' : step === 'target' ? '2' : '3'} of 3
        </Text>
        <Text style={styles.title}>
          {step === 'native'
            ? 'What language do you speak?'
            : step === 'target'
              ? 'What do you want to learn?'
              : "What's your level?"}
        </Text>
      </View>

      <View style={styles.options}>
        {step === 'native' &&
          NATIVE_LANGUAGES.map((lang) => (
            <Pressable
              key={lang.id}
              style={[styles.card, nativeLang === lang.id && styles.cardSelected]}
              onPress={() => setNativeLang(lang.id)}
            >
              <Text style={styles.cardFlag}>{lang.flag}</Text>
              <Text style={styles.cardLabel}>{lang.label}</Text>
            </Pressable>
          ))}

        {step === 'target' &&
          TARGET_LANGUAGES.map((lang) => (
            <Pressable
              key={lang.id}
              style={[styles.card, targetLang === lang.id && styles.cardSelected]}
              onPress={() => setTargetLang(lang.id)}
            >
              <Text style={styles.cardFlag}>{lang.flag}</Text>
              <Text style={styles.cardLabel}>{lang.label}</Text>
            </Pressable>
          ))}

        {step === 'level' &&
          LEVELS.map((lvl) => (
            <Pressable
              key={lvl.id}
              style={[styles.levelCard, level === lvl.id && styles.cardSelected]}
              onPress={() => setLevel(lvl.id)}
            >
              <Text style={styles.levelLabel}>{lvl.label}</Text>
              <Text style={styles.levelDesc}>{lvl.description}</Text>
            </Pressable>
          ))}
      </View>

      <Button
        mode="contained"
        onPress={handleNext}
        loading={loading}
        disabled={
          loading ||
          (step === 'native' && !nativeLang) ||
          (step === 'target' && !targetLang) ||
          (step === 'level' && !level)
        }
        style={styles.button}
        buttonColor={colors.primary}
        textColor={colors.white}
      >
        {step === 'level' ? "Let's Go!" : 'Continue'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...typography.h1,
  },
  options: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignContent: 'flex-start',
  },
  card: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.surfaceElevated,
  },
  cardFlag: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardLabel: {
    ...typography.h3,
  },
  levelCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  levelLabel: {
    ...typography.h3,
  },
  levelDesc: {
    ...typography.bodySmall,
  },
  button: {
    height: 48,
    justifyContent: 'center',
    borderRadius: radius.md,
  },
});
