import type { Course, Lesson, CourseId } from '../types';

// Metro bundler requires static require paths — use lookup maps

const COURSES: Record<string, Course> = {
  'en-es': require('../../content/en-es/units.json'),
  'en-it': require('../../content/en-it/units.json'),
  'sr-es': require('../../content/sr-es/units.json'),
  'sr-it': require('../../content/sr-it/units.json'),
};

const LESSONS: Record<string, Lesson> = {
  // English → Spanish
  'en-es/unit-1/lesson-1': require('../../content/en-es/unit-1/lesson-1.json'),
  'en-es/unit-1/lesson-2': require('../../content/en-es/unit-1/lesson-2.json'),
  'en-es/unit-1/lesson-3': require('../../content/en-es/unit-1/lesson-3.json'),
  'en-es/unit-2/lesson-1': require('../../content/en-es/unit-2/lesson-1.json'),
  'en-es/unit-2/lesson-2': require('../../content/en-es/unit-2/lesson-2.json'),
  'en-es/unit-2/lesson-3': require('../../content/en-es/unit-2/lesson-3.json'),
  // English → Italian
  'en-it/unit-1/lesson-1': require('../../content/en-it/unit-1/lesson-1.json'),
  'en-it/unit-1/lesson-2': require('../../content/en-it/unit-1/lesson-2.json'),
  'en-it/unit-1/lesson-3': require('../../content/en-it/unit-1/lesson-3.json'),
  'en-it/unit-2/lesson-1': require('../../content/en-it/unit-2/lesson-1.json'),
  'en-it/unit-2/lesson-2': require('../../content/en-it/unit-2/lesson-2.json'),
  'en-it/unit-2/lesson-3': require('../../content/en-it/unit-2/lesson-3.json'),
  // Serbian → Spanish
  'sr-es/unit-1/lesson-1': require('../../content/sr-es/unit-1/lesson-1.json'),
  'sr-es/unit-1/lesson-2': require('../../content/sr-es/unit-1/lesson-2.json'),
  'sr-es/unit-1/lesson-3': require('../../content/sr-es/unit-1/lesson-3.json'),
  'sr-es/unit-2/lesson-1': require('../../content/sr-es/unit-2/lesson-1.json'),
  'sr-es/unit-2/lesson-2': require('../../content/sr-es/unit-2/lesson-2.json'),
  'sr-es/unit-2/lesson-3': require('../../content/sr-es/unit-2/lesson-3.json'),
  // Serbian → Italian
  'sr-it/unit-1/lesson-1': require('../../content/sr-it/unit-1/lesson-1.json'),
  'sr-it/unit-1/lesson-2': require('../../content/sr-it/unit-1/lesson-2.json'),
  'sr-it/unit-1/lesson-3': require('../../content/sr-it/unit-1/lesson-3.json'),
  'sr-it/unit-2/lesson-1': require('../../content/sr-it/unit-2/lesson-1.json'),
  'sr-it/unit-2/lesson-2': require('../../content/sr-it/unit-2/lesson-2.json'),
  'sr-it/unit-2/lesson-3': require('../../content/sr-it/unit-2/lesson-3.json'),
};

export function getCourse(courseId: CourseId): Course | null {
  return COURSES[courseId] ?? null;
}

export function getLesson(
  courseId: CourseId,
  unitId: string,
  lessonId: string
): Lesson | null {
  const key = `${courseId}/${unitId}/${lessonId}`;
  return LESSONS[key] ?? null;
}

export function getCourseId(nativeLang: string, targetLang: string): CourseId {
  return `${nativeLang}-${targetLang}` as CourseId;
}
