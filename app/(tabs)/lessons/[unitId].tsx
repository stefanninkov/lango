import { View, StyleSheet, FlatList } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../../src/theme';
import { useAuthStore } from '../../../src/stores/authStore';
import { useProgressStore } from '../../../src/stores/progressStore';
import { getCourse, getCourseId } from '../../../src/utils/content';
import LessonCard from '../../../src/components/LessonCard';
import type { LessonMeta } from '../../../src/types';

export default function LessonListScreen() {
  const insets = useSafeAreaInsets();
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const user = useAuthStore((s) => s.user);
  const progress = useProgressStore((s) => s.progress);

  const courseId = user ? getCourseId(user.nativeLanguage, user.targetLanguage) : 'en-es';
  const course = getCourse(courseId as any);
  const unit = course?.units.find((u) => u.id === unitId);

  const renderLesson = ({ item }: { item: LessonMeta }) => (
    <LessonCard
      title={item.title}
      wordCount={item.wordCount}
      isCompleted={progress?.completedLessons.includes(item.id) ?? false}
      quizScore={progress?.quizScores[item.id]}
      onPress={() =>
        router.push(`/(tabs)/lessons/${item.id}?unitId=${unitId}`)
      }
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
            {unit?.lessons.length ?? 0} lessons
          </Text>
        </View>
      </View>

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
    paddingBottom: spacing.md,
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
  list: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
