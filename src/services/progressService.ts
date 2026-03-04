import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserProgress, CourseId } from '../types';

const progressDocRef = (uid: string, courseId: CourseId) =>
  doc(db, 'users', uid, 'progress', courseId);

export async function getProgress(uid: string, courseId: CourseId): Promise<UserProgress | null> {
  const snap = await getDoc(progressDocRef(uid, courseId));
  if (!snap.exists()) {
    const initial: UserProgress = {
      courseId,
      completedLessons: [],
      quizScores: {},
      currentUnit: 'unit-1',
      currentLesson: 'lesson-1',
    };
    await setDoc(progressDocRef(uid, courseId), initial);
    return initial;
  }
  return snap.data() as UserProgress;
}

export async function completeLesson(
  uid: string,
  courseId: CourseId,
  lessonId: string,
  quizScore: number
) {
  await updateDoc(progressDocRef(uid, courseId), {
    completedLessons: arrayUnion(lessonId),
    [`quizScores.${lessonId}`]: quizScore,
  });
}

export async function addXP(uid: string, amount: number) {
  await updateDoc(doc(db, 'users', uid), {
    xp: increment(amount),
  });
}

export async function updateStreak(uid: string) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return;

  const data = userDoc.data();
  const today = new Date().toISOString().split('T')[0];
  const lastActive = data.lastActiveDate;

  if (lastActive === today) return; // Already active today

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const newStreak = lastActive === yesterday ? (data.streak || 0) + 1 : 1;

  await updateDoc(doc(db, 'users', uid), {
    streak: newStreak,
    lastActiveDate: today,
  });
}
