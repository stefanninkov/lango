import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { updateUserProfile } from '../../src/services/authService';
import type { NativeLanguage, TargetLanguage } from '../../src/types';

type Step = 'native' | 'target';

const NATIVE_LANGUAGES: { id: NativeLanguage; label: string; flag: string }[] = [
  { id: 'en', label: 'English', flag: 'EN' },
  { id: 'sr', label: 'Serbian', flag: 'SR' },
];

const TARGET_LANGUAGES: { id: TargetLanguage; label: string; flag: string }[] = [
  { id: 'es', label: 'Spanish', flag: 'ES' },
  { id: 'it', label: 'Italian', flag: 'IT' },
];

export default function OnboardingScreen() {
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState<Step>('native');
  const [nativeLang, setNativeLang] = useState<NativeLanguage | null>(null);
  const [targetLang, setTargetLang] = useState<TargetLanguage | null>(null);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!user || !nativeLang || !targetLang) return;
    setLoading(true);
    try {
      await updateUserProfile(user.uid, {
        nativeLanguage: nativeLang,
        targetLanguage: targetLang,
        level: 'A1',
      });
      setUser({
        ...user,
        nativeLanguage: nativeLang,
        targetLanguage: targetLang,
        level: 'A1',
      });
    } catch (e) {
      // Profile will be updated on next login
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 'native' && nativeLang) setStep('target');
    else if (step === 'target' && targetLang) handleComplete();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>
          Step {step === 'native' ? '1' : '2'} of 2
        </Text>
        <Text style={styles.title}>
          {step === 'native'
            ? 'What language do you speak?'
            : 'What do you want to learn?'}
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
      </View>

      <Button
        mode="contained"
        onPress={handleNext}
        loading={loading}
        disabled={
          loading ||
          (step === 'native' && !nativeLang) ||
          (step === 'target' && !targetLang)
        }
        style={styles.button}
        buttonColor={colors.primary}
        textColor={colors.white}
      >
        {step === 'target' ? "Let's Go!" : 'Continue'}
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
  button: {
    height: 48,
    justifyContent: 'center',
    borderRadius: radius.md,
  },
});
