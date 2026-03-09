import { getCourse, getLesson, getCourseId } from '../../src/utils/content';

describe('content utils', () => {
  describe('getCourseId', () => {
    it('combines native and target language into course ID', () => {
      expect(getCourseId('en', 'es')).toBe('en-es');
      expect(getCourseId('sr', 'it')).toBe('sr-it');
      expect(getCourseId('en', 'it')).toBe('en-it');
      expect(getCourseId('sr', 'es')).toBe('sr-es');
    });
  });

  describe('getCourse', () => {
    it('returns course data for valid course ID', () => {
      const course = getCourse('en-es');
      expect(course).not.toBeNull();
      expect(course!.courseId).toBe('en-es');
      expect(course!.courseName).toBe('Spanish from English');
      expect(course!.units.length).toBeGreaterThan(0);
    });

    it('returns course data for all 4 language pairs', () => {
      expect(getCourse('en-es')).not.toBeNull();
      expect(getCourse('en-it')).not.toBeNull();
      expect(getCourse('sr-es')).not.toBeNull();
      expect(getCourse('sr-it')).not.toBeNull();
    });

    it('returns null for invalid course ID', () => {
      expect(getCourse('xx-yy' as any)).toBeNull();
    });

    it('each course has at least one unit with lessons', () => {
      const courseIds = ['en-es', 'en-it', 'sr-es', 'sr-it'] as const;
      for (const id of courseIds) {
        const course = getCourse(id);
        expect(course!.units.length).toBeGreaterThan(0);
        for (const unit of course!.units) {
          expect(unit.lessons.length).toBeGreaterThan(0);
          expect(unit.id).toBeTruthy();
          expect(unit.title).toBeTruthy();
        }
      }
    });
  });

  describe('getLesson', () => {
    it('returns lesson data for valid lesson path', () => {
      const lesson = getLesson('en-es', 'unit-1', 'lesson-1');
      expect(lesson).not.toBeNull();
      expect(lesson!.id).toBe('lesson-1');
      expect(lesson!.title).toBeTruthy();
    });

    it('returns null for invalid lesson path', () => {
      expect(getLesson('en-es', 'unit-99', 'lesson-99')).toBeNull();
    });

    it('each lesson has required sections', () => {
      const lesson = getLesson('en-es', 'unit-1', 'lesson-1');
      expect(lesson).not.toBeNull();

      // Vocabulary
      expect(lesson!.vocabulary.length).toBeGreaterThan(0);
      for (const vocab of lesson!.vocabulary) {
        expect(vocab.id).toBeTruthy();
        expect(vocab.word).toBeTruthy();
        expect(vocab.translation).toBeTruthy();
        expect(vocab.pronunciation).toBeTruthy();
        expect(vocab.example).toBeTruthy();
        expect(vocab.exampleTranslation).toBeTruthy();
      }

      // Grammar
      expect(lesson!.grammar.title).toBeTruthy();
      expect(lesson!.grammar.explanation).toBeTruthy();
      expect(lesson!.grammar.examples.length).toBeGreaterThan(0);

      // Exercises
      expect(lesson!.exercises.length).toBeGreaterThan(0);
      for (const ex of lesson!.exercises) {
        expect(ex.type).toBeTruthy();
        expect(ex.id).toBeTruthy();
      }

      // Quiz
      expect(lesson!.quiz.length).toBeGreaterThan(0);
      for (const q of lesson!.quiz) {
        expect(q.id).toBeTruthy();
        expect(q.question).toBeTruthy();
        expect(q.options.length).toBe(4);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(4);
      }
    });
  });
});
