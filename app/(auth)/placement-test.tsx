import { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { updateUserProfile } from '../../src/services/authService';
import { getPlacementTest, scorePlacementTest, getSkillBreakdown } from '../../src/utils/placementTest';
import { getCourseId } from '../../src/utils/content';
import ProgressBar from '../../src/components/ProgressBar';
import FadeInView from '../../src/components/FadeInView';
import type { PlacementQuestion, PlacementResult, CourseId } from '../../src/types';

type Phase = 'intro' | 'test' | 'results';

const SKILL_ICONS: Record<string, string> = {
  vocabulary: 'book-open-variant',
  grammar: 'format-text',
  reading: 'text-box-outline',
};

const SKILL_LABELS: Record<string, string> = {
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  reading: 'Reading',
};

const LEVEL_COLORS: Record<string, string> = {
  A1: colors.secondary,
  A2: '#4ECDC4',
  B1: colors.primary,
  B2: colors.primaryLight,
  C1: colors.warning,
  C2: colors.gold,
};

const LEVEL_LABELS: Record<string, string> = {
  A1: 'A1 — Beginner',
  A2: 'A2 — Elementary',
  B1: 'B1 — Intermediate',
  B2: 'B2 — Upper Intermediate',
  C1: 'C1 — Advanced',
  C2: 'C2 — Mastery',
};

export default function PlacementTestScreen() {
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuthStore();

  const courseId = user
    ? getCourseId(user.nativeLanguage, user.targetLanguage)
    : ('en-es' as CourseId);
  const test = getPlacementTest(courseId);
  const questions = test?.questions ?? [];

  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
  };

  const handleNext = useCallback(() => {
    if (selectedOption === null || !currentQuestion) return;

    const newAnswers = { ...answers, [currentQuestion.id]: selectedOption };
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Test complete — score it
      const placementResult = scorePlacementTest(questions, newAnswers);
      setResult(placementResult);
      setPhase('results');
    }
  }, [selectedOption, currentQuestion, answers, currentIndex, questions]);

  const handleFinish = async () => {
    if (!user || !result) return;
    setLoading(true);
    try {
      await updateUserProfile(user.uid, {
        level: result.level,
      });
      setUser({
        ...user,
        level: result.level,
      });
    } catch {
      // Profile will be updated on next login
    } finally {
      setLoading(false);
    }
  };

  const skillBreakdown = result ? getSkillBreakdown(questions, answers) : [];

  // Intro screen
  if (phase === 'intro') {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <IconButton
          icon="arrow-left"
          iconColor={colors.textPrimary}
          size={24}
          onPress={() => router.back()}
          style={styles.backButton}
        />

        <FadeInView delay={0}>
          <View style={styles.introContent}>
            <View style={styles.introIconBg}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={colors.primary} />
            </View>
            <Text style={styles.introTitle}>Placement Test</Text>
            <Text style={styles.introSubtitle}>
              Find out your level with a quick diagnostic test
            </Text>

            <View style={styles.infoCards}>
              <View style={styles.infoCard}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
                <View>
                  <Text style={styles.infoCardTitle}>25 Questions</Text>
                  <Text style={styles.infoCardDesc}>Takes about 5-10 minutes</Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <MaterialCommunityIcons name="format-list-checks" size={20} color={colors.secondary} />
                <View>
                  <Text style={styles.infoCardTitle}>3 Skill Areas</Text>
                  <Text style={styles.infoCardDesc}>Vocabulary, Grammar & Reading</Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <MaterialCommunityIcons name="trending-up" size={20} color={colors.gold} />
                <View>
                  <Text style={styles.infoCardTitle}>Adaptive Difficulty</Text>
                  <Text style={styles.infoCardDesc}>Beginner to Advanced questions</Text>
                </View>
              </View>
            </View>
          </View>
        </FadeInView>

        <Button
          mode="contained"
          onPress={() => setPhase('test')}
          style={styles.startButton}
          buttonColor={colors.primary}
          textColor={colors.white}
        >
          Start Test
        </Button>
      </View>
    );
  }

  // Results screen
  if (phase === 'results' && result) {
    const levelColor = LEVEL_COLORS[result.level];
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.resultsContent, { paddingTop: insets.top + spacing.lg }]}
      >
        <FadeInView delay={0}>
          <View style={styles.resultsHeader}>
            <View style={[styles.resultsBadge, { borderColor: levelColor }]}>
              <MaterialCommunityIcons name="trophy" size={36} color={levelColor} />
            </View>
            <Text style={styles.resultsTitle}>Your Level</Text>
            <Text style={[styles.resultsLevel, { color: levelColor }]}>
              {LEVEL_LABELS[result.level]}
            </Text>
            <Text style={styles.resultsScore}>{result.score}% overall score</Text>
          </View>
        </FadeInView>

        <FadeInView delay={100}>
          <View style={styles.skillsSection}>
            <Text style={styles.skillsTitle}>Skill Breakdown</Text>
            {skillBreakdown.map((skill) => (
              <View key={skill.skill} style={styles.skillRow}>
                <View style={styles.skillIcon}>
                  <MaterialCommunityIcons
                    name={SKILL_ICONS[skill.skill] as any}
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.skillInfo}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillLabel}>{SKILL_LABELS[skill.skill]}</Text>
                    <Text style={styles.skillScore}>
                      {skill.correct}/{skill.total} ({skill.percent}%)
                    </Text>
                  </View>
                  <ProgressBar
                    progress={skill.percent / 100}
                    color={skill.percent >= 60 ? colors.secondary : colors.accent}
                    height={4}
                  />
                </View>
              </View>
            ))}
          </View>
        </FadeInView>

        <FadeInView delay={200}>
          <View style={styles.recommendSection}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color={colors.gold} />
            <Text style={styles.recommendText}>
              We recommend starting at {result.startUnit.replace('-', ' ').replace('unit', 'Unit')}. You can always go back to review earlier content.
            </Text>
          </View>
        </FadeInView>

        <Button
          mode="contained"
          onPress={handleFinish}
          loading={loading}
          style={styles.finishButton}
          buttonColor={levelColor}
          textColor={colors.white}
        >
          Start Learning
        </Button>
      </ScrollView>
    );
  }

  // Test screen
  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      {/* Header with progress */}
      <View style={styles.testHeader}>
        <IconButton
          icon="close"
          iconColor={colors.textMuted}
          size={22}
          onPress={() => router.back()}
        />
        <View style={styles.progressBarContainer}>
          <ProgressBar progress={progress} color={colors.primary} height={6} />
        </View>
        <Text style={styles.questionCount}>
          {currentIndex + 1}/{questions.length}
        </Text>
      </View>

      {/* Skill & level badge */}
      {currentQuestion && (
        <FadeInView delay={0} key={currentIndex}>
          <View style={styles.questionMeta}>
            <View style={[styles.skillBadge, { backgroundColor: `${LEVEL_COLORS[currentQuestion.level]}15` }]}>
              <MaterialCommunityIcons
                name={SKILL_ICONS[currentQuestion.skill] as any}
                size={14}
                color={LEVEL_COLORS[currentQuestion.level]}
              />
              <Text style={[styles.skillBadgeText, { color: LEVEL_COLORS[currentQuestion.level] }]}>
                {SKILL_LABELS[currentQuestion.skill]}
              </Text>
            </View>
          </View>

          {/* Question */}
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {/* Options */}
          <View style={styles.optionsList}>
            {currentQuestion.options.map((option, index) => (
              <Pressable
                key={index}
                style={[
                  styles.optionCard,
                  selectedOption === index && styles.optionCardSelected,
                ]}
                onPress={() => handleSelectOption(index)}
              >
                <View style={[
                  styles.optionRadio,
                  selectedOption === index && styles.optionRadioSelected,
                ]}>
                  {selectedOption === index && (
                    <View style={styles.optionRadioDot} />
                  )}
                </View>
                <Text style={[
                  styles.optionText,
                  selectedOption === index && styles.optionTextSelected,
                ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </FadeInView>
      )}

      {/* Next button */}
      <View style={styles.testFooter}>
        <Button
          mode="contained"
          onPress={handleNext}
          disabled={selectedOption === null}
          style={styles.nextButton}
          buttonColor={colors.primary}
          textColor={colors.white}
        >
          {currentIndex < questions.length - 1 ? 'Next' : 'Finish'}
        </Button>
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
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: -spacing.sm,
  },
  // Intro
  introContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  introIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  introTitle: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  introSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  infoCards: {
    width: '100%',
    gap: spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  infoCardTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  infoCardDesc: {
    ...typography.caption,
    color: colors.textMuted,
  },
  startButton: {
    height: 48,
    justifyContent: 'center',
    borderRadius: radius.md,
    marginBottom: spacing.xl,
  },
  // Test
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressBarContainer: {
    flex: 1,
  },
  questionCount: {
    ...typography.caption,
    color: colors.textMuted,
    minWidth: 40,
    textAlign: 'right',
  },
  questionMeta: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  skillBadgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  questionText: {
    ...typography.h2,
    marginBottom: spacing.xl,
    lineHeight: 30,
  },
  optionsList: {
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
  },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: colors.primary,
  },
  optionRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  optionText: {
    ...typography.body,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  testFooter: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
  },
  nextButton: {
    height: 48,
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  // Results
  resultsContent: {
    paddingBottom: spacing.xxl,
  },
  resultsHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  resultsBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  resultsTitle: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  resultsLevel: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  resultsScore: {
    ...typography.body,
    color: colors.textSecondary,
  },
  skillsSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  skillsTitle: {
    ...typography.h3,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  skillIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skillLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  skillScore: {
    ...typography.caption,
    color: colors.textMuted,
  },
  recommendSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  recommendText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  finishButton: {
    height: 48,
    justifyContent: 'center',
    borderRadius: radius.md,
  },
});
