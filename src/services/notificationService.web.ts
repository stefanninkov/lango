/**
 * Notification service — web stub.
 *
 * expo-notifications does not support web and crashes during SSR because
 * it accesses localStorage at module load time. This file provides no-op
 * implementations so the rest of the app works on web without changes.
 *
 * Metro automatically picks .web.ts over .ts for web builds.
 */

export async function requestPermissions(): Promise<string | null> {
  return null;
}

export async function scheduleDailyReminder(
  _hour: number = 19,
  _minute: number = 0
): Promise<string> {
  return '';
}

export async function scheduleStreakReminder(_streakDays: number): Promise<string> {
  return '';
}

export async function scheduleReviewReminder(_dueCount: number): Promise<string> {
  return '';
}

export async function cancelDailyReminder(): Promise<void> {}

export async function cancelAllNotifications(): Promise<void> {}

export async function getPermissionStatus(): Promise<boolean> {
  return false;
}
