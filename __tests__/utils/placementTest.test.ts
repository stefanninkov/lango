import {
  getPlacementTest,
  scorePlacementTest,
  getSkillBreakdown,
} from '../../src/utils/placementTest';
import type { PlacementQuestion } from '../../src/types';

describe('placementTest utils', () => {
  describe('getPlacementTest', () => {
    it('returns placement test for all 4 language pairs', () => {
      const courseIds = ['en-es', 'en-it', 'sr-es', 'sr-it'] as const;
      for (const id of courseIds) {
        const test = getPlacementTest(id);
        expect(test).not.toBeNull();
        expect(test!.courseId).toBe(id);
        expect(test!.questions.length).toBe(25);
      }
    });

    it('each test has questions across all 3 levels', () => {
      const test = getPlacementTest('en-es')!;
      const levels = new Set(test.questions.map((q) => q.level));
      expect(levels.has('beginner')).toBe(true);
      expect(levels.has('intermediate')).toBe(true);
      expect(levels.has('advanced')).toBe(true);
    });

    it('each test has questions across all 3 skills', () => {
      const test = getPlacementTest('en-es')!;
      const skills = new Set(test.questions.map((q) => q.skill));
      expect(skills.has('vocabulary')).toBe(true);
      expect(skills.has('grammar')).toBe(true);
      expect(skills.has('reading')).toBe(true);
    });

    it('each question has 4 options and valid correctIndex', () => {
      const test = getPlacementTest('en-es')!;
      for (const q of test.questions) {
        expect(q.options.length).toBe(4);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(4);
      }
    });
  });

  describe('scorePlacementTest', () => {
    const questions: PlacementQuestion[] = [
      { id: 'b1', level: 'beginner', skill: 'vocabulary', question: '', options: ['a', 'b', 'c', 'd'], correctIndex: 0 },
      { id: 'b2', level: 'beginner', skill: 'grammar', question: '', options: ['a', 'b', 'c', 'd'], correctIndex: 1 },
      { id: 'i1', level: 'intermediate', skill: 'vocabulary', question: '', options: ['a', 'b', 'c', 'd'], correctIndex: 2 },
      { id: 'i2', level: 'intermediate', skill: 'grammar', question: '', options: ['a', 'b', 'c', 'd'], correctIndex: 3 },
      { id: 'a1', level: 'advanced', skill: 'reading', question: '', options: ['a', 'b', 'c', 'd'], correctIndex: 0 },
      { id: 'a2', level: 'advanced', skill: 'reading', question: '', options: ['a', 'b', 'c', 'd'], correctIndex: 1 },
    ];

    it('assigns beginner when all answers wrong', () => {
      const answers = { b1: 3, b2: 3, i1: 3, i2: 0, a1: 3, a2: 3 };
      const result = scorePlacementTest(questions, answers);
      expect(result.level).toBe('beginner');
      expect(result.startUnit).toBe('unit-1');
    });

    it('assigns beginner with start at unit-3 for strong beginner', () => {
      // Get all beginner correct, none intermediate
      const answers = { b1: 0, b2: 1, i1: 0, i2: 0, a1: 3, a2: 3 };
      const result = scorePlacementTest(questions, answers);
      expect(result.level).toBe('beginner');
      expect(result.startUnit).toBe('unit-3');
    });

    it('assigns intermediate when beginner+intermediate correct', () => {
      const answers = { b1: 0, b2: 1, i1: 2, i2: 3, a1: 3, a2: 3 };
      const result = scorePlacementTest(questions, answers);
      expect(result.level).toBe('intermediate');
    });

    it('assigns advanced when all correct', () => {
      const answers = { b1: 0, b2: 1, i1: 2, i2: 3, a1: 0, a2: 1 };
      const result = scorePlacementTest(questions, answers);
      expect(result.level).toBe('advanced');
    });

    it('returns overall score as percentage', () => {
      const answers = { b1: 0, b2: 1, i1: 2, i2: 3, a1: 0, a2: 1 };
      const result = scorePlacementTest(questions, answers);
      expect(result.score).toBe(100);
    });
  });

  describe('getSkillBreakdown', () => {
    const questions: PlacementQuestion[] = [
      { id: 'v1', level: 'beginner', skill: 'vocabulary', question: '', options: ['a', 'b', 'c', 'd'], correctIndex: 0 },
      { id: 'g1', level: 'beginner', skill: 'grammar', question: '', options: ['a', 'b', 'c', 'd'], correctIndex: 1 },
      { id: 'r1', level: 'beginner', skill: 'reading', question: '', options: ['a', 'b', 'c', 'd'], correctIndex: 2 },
    ];

    it('returns breakdown per skill', () => {
      const answers = { v1: 0, g1: 0, r1: 2 };
      const breakdown = getSkillBreakdown(questions, answers);
      expect(breakdown).toHaveLength(3);

      const vocab = breakdown.find((s) => s.skill === 'vocabulary')!;
      expect(vocab.correct).toBe(1);
      expect(vocab.total).toBe(1);
      expect(vocab.percent).toBe(100);

      const grammar = breakdown.find((s) => s.skill === 'grammar')!;
      expect(grammar.correct).toBe(0);
      expect(grammar.percent).toBe(0);

      const reading = breakdown.find((s) => s.skill === 'reading')!;
      expect(reading.correct).toBe(1);
      expect(reading.percent).toBe(100);
    });
  });
});
