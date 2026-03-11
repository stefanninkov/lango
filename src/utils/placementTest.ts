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
 * Score the placement test and determine the user's CEFR level.
 *
 * NOTE: The placement test is currently disabled in onboarding (Duolingo-style
 * sequential progression). This scoring logic is kept for potential future use.
 *
 * All users now start at A1 and must complete units sequentially.
 */
export function scorePlacementTest(
  questions: PlacementQuestion[],
  answers: Record<string, number>
): PlacementResult {
  const byLevel: Record<string, { correct: number; total: number }> = {
    A1: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    C1: { correct: 0, total: 0 },
  };

  for (const q of questions) {
    const lvl = byLevel[q.level];
    if (lvl) {
      lvl.total++;
      if (answers[q.id] === q.correctIndex) {
        lvl.correct++;
      }
    }
  }

  const totalCorrect = Object.values(byLevel).reduce((s, l) => s + l.correct, 0);
  const totalQuestions = questions.length;
  const overallScore = Math.round((totalCorrect / totalQuestions) * 100);

  // All users start at A1 — sequential progression
  return { level: 'A1' as Level, score: overallScore, startUnit: 'unit-1' };
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
