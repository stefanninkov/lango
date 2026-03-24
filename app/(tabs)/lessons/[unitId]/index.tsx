import { View, StyleSheet, FlatList } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../../../src/theme';
import { useAuthStore } from '../../../../src/stores/authStore';
import { useProgressStore } from '../../../../src/stores/progressStore';
import { getCourse, getCourseId } from '../../../../src/utils/content';
import FadeInView from '../../../../src/components/FadeInView';
import ProgressBar from '../../../../src/components/ProgressBar';
import type { LessonMeta } from '../../../../src/types';

export default function LessonListScreen() {
  const insets = useSafeAreaInsets();
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const user = useAuthStore((s) => s.user);
  const progress = useProgressStore((s) => s.progress);

  const courseId = user ? getCourseId(user.nativeLanguage, user.targetLanguage) : 'en-es';
  const course = getCourse(courseId as any);
  const unit = course?.units.find((u) => u.id === unitId);
  const completedCount = unit?.lessons.filter((l) => progress?.completedLessons.includes(l.id)).length ?? 0;
  const totalLessons = unit?.lessons.length ?? 0;

  const renderLesson = ({ item, index }: { item: LessonMeta; index: number }) => {
    const isCompleted = progress?.completedLessons.includes(item.id) ?? false;
    const score = progress?.quizScores[item.id];

    return (
      <FadeInView delay={index * 80}>
        <View
          style={[styles.lessonCard, isCompleted && styles.lessonCardComplete]}
        >
          <View style={styles.lessonRow}>
            {/* Step indicator */}
            <View style={styles.stepColumn}>
              <View style={[styles.stepCircle, isCompleted && styles.stepCircleComplete]}>
                {isCompleted ? (
                  <MaterialCommunityIcons name="check" size={16} color={colors.secondary} />
                ) : (
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                )}
              </View>
              {index < totalLessons - 1 && (
                <View style={[styles.stepLine, isCompleted && styles.stepLineComplete]} />
              )}
            </View>

            {/* Content */}
            <View
              style={styles.lessonContent}
              onTouchEnd={() => router.push(`/(tabs)/lessons/${unitId}/${item.id}`)}
            >
              <Text style={styles.lessonTitle}>{item.title}</Text>
              <View style={styles.lessonMeta}>
                <MaterialCommunityIcons name="cards-outline" size={14} color={colors.textMuted} />
                <Text style={styles.lessonMetaText}>{item.wordCount} words</Text>
                {isCompleted && score !== undefined && (
                  <>
                    <View style={styles.dot} />
                    <MaterialCommunityIcons name="star" size={14} color={colors.gold} />
                    <Text style={[styles.lessonMetaText, { color: colors.gold }]}>{score}%</Text>
                  </>
                )}
              </View>
            </View>

            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
          </View>
        </View>
      </FadeInView>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FadeInView delay={0}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            iconColor={colors.textPrimary}
            size={24}
            onPress={() => router.back()}
          />
          <View style={styles.headerText}>
            <Text style={styles.title}>{unit?.title ?? 'Unit'}</Text>
            <Text style={styles.subtitle}>
              {completedCount}/{totalLessons} lessons completed
            </Text>
          </View>
        </View>
        <View style={styles.headerProgress}>
          <ProgressBar
            progress={totalLessons > 0 ? completedCount / totalLessons : 0}
            color={completedCount >= totalLessons ? colors.secondary : colors.primary}
            height={4}
          />
        </View>
      </FadeInView>

      <FlatList
        data={unit?.lessons ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderLesson}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  headerProgress: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  list: {
    gap: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  // Lesson card with step indicator
  lessonCard: {
    paddingVertical: 0,
  },
  lessonCardComplete: {},
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepColumn: {
    alignItems: 'center',
    width: 32,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleComplete: {
    borderColor: colors.secondary,
    backgroundColor: 'rgba(0, 217, 166, 0.12)',
  },
  stepNumber: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
  },
  stepLine: {
    width: 2,
    height: 40,
    backgroundColor: colors.border,
  },
  stepLineComplete: {
    backgroundColor: colors.secondary,
  },
  lessonContent: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  lessonTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lessonMetaText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
  },
});
