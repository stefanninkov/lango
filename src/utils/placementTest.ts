import type { PlacementQuestion, PlacementTest, PlacementResult, Level, CourseId } from '../types';

const PLACEMENT_TESTS: Record<string, PlacementTest> = {
  'en-es': require('../../content/en-es/placement-test.json'),
  'en-it': require('../../content/en-it/placement-test.json'),
  'sr-es': require('../../content/sr-es/placement-test.json'),
  'sr-it': require('../../content/sr-it/placement-test.json'),
};

export function getPlacementTest(courseId: CourseId): PlacementTest | null {
  return PLACEMENT_TESTS[courseId] ?? null;
}

/**
 * Score the placement test and determine the user's level.
 *
 * Scoring logic:
 * - 25 questions: 8 beginner, 8 intermediate, 9 advanced
 * - Each level's questions are scored separately
 * - If beginner score < 60% → beginner (start at unit-1)
 * - If intermediate score < 60% → beginner (start at unit-1) but skip to unit-3 if beginner >= 75%
 * - If advanced score < 60% → intermediate (start at unit-4)
 * - If advanced score >= 60% → advanced (start at unit-7)
 */
export function scorePlacementTest(
  questions: PlacementQuestion[],
  answers: Record<string, number> // questionId -> selected index
): PlacementResult {
  const byLevel: Record<Level, { correct: number; total: number }> = {
    beginner: { correct: 0, total: 0 },
    intermediate: { correct: 0, total: 0 },
    advanced: { correct: 0, total: 0 },
  };

  for (const q of questions) {
    byLevel[q.level].total++;
    if (answers[q.id] === q.correctIndex) {
      byLevel[q.level].correct++;
    }
  }

  const beginnerPct = byLevel.beginner.total > 0
    ? (byLevel.beginner.correct / byLevel.beginner.total) * 100
    : 0;
  const intermediatePct = byLevel.intermediate.total > 0
    ? (byLevel.intermediate.correct / byLevel.intermediate.total) * 100
    : 0;
  const advancedPct = byLevel.advanced.total > 0
    ? (byLevel.advanced.correct / byLevel.advanced.total) * 100
    : 0;

  const totalCorrect = byLevel.beginner.correct + byLevel.intermediate.correct + byLevel.advanced.correct;
  const totalQuestions = questions.length;
  const overallScore = Math.round((totalCorrect / totalQuestions) * 100);

  // Determine level
  if (beginnerPct < 60) {
    return { level: 'beginner', score: overallScore, startUnit: 'unit-1' };
  }

  if (intermediatePct < 60) {
    // Good at beginner, not intermediate yet
    // If very strong beginner (>=75%), start at unit-3 (last beginner unit)
    if (beginnerPct >= 75) {
      return { level: 'beginner', score: overallScore, startUnit: 'unit-3' };
    }
    return { level: 'beginner', score: overallScore, startUnit: 'unit-1' };
  }

  if (advancedPct < 60) {
    // Strong intermediate
    if (intermediatePct >= 75) {
      return { level: 'intermediate', score: overallScore, startUnit: 'unit-6' };
    }
    return { level: 'intermediate', score: overallScore, startUnit: 'unit-4' };
  }

  // Advanced
  if (advancedPct >= 75) {
    return { level: 'advanced', score: overallScore, startUnit: 'unit-9' };
  }
  return { level: 'advanced', score: overallScore, startUnit: 'unit-7' };
}

/**
 * Get the skill breakdown for showing results.
 */
export function getSkillBreakdown(
  questions: PlacementQuestion[],
  answers: Record<string, number>
): { skill: string; correct: number; total: number; percent: number }[] {
  const skills: Record<string, { correct: number; total: number }> = {
    vocabulary: { correct: 0, total: 0 },
    grammar: { correct: 0, total: 0 },
    reading: { correct: 0, total: 0 },
  };

  for (const q of questions) {
    skills[q.skill].total++;
    if (answers[q.id] === q.correctIndex) {
      skills[q.skill].correct++;
    }
  }

  return Object.entries(skills).map(([skill, data]) => ({
    skill,
    correct: data.correct,
    total: data.total,
    percent: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
  }));
}
