import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request push notification permissions.
 * Returns the Expo push token if granted.
 */
export async function requestPermissions(): Promise<string | null> {
  if (!Device.isDevice) {
    // Push notifications only work on physical devices
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Lango',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

/**
 * Schedule a daily study reminder notification.
 */
export async function scheduleDailyReminder(
  hour: number = 19,
  minute: number = 0
): Promise<string> {
  // Cancel any existing daily reminders first
  await cancelDailyReminder();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to study!',
      body: "Don't break your streak! Complete today's lesson and review.",
      data: { type: 'daily_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return id;
}

/**
 * Schedule a streak-at-risk notification (fires once, next day).
 */
export async function scheduleStreakReminder(streakDays: number): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${streakDays}-day streak at risk!`,
      body: "You haven't studied today. Open Lango to keep your streak alive!",
      data: { type: 'streak_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 20, // 20 hours from now
    },
  });

  return id;
}

/**
 * Schedule a review reminder when cards are due.
 */
export async function scheduleReviewReminder(dueCount: number): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Review cards waiting!',
      body: `You have ${dueCount} flashcard${dueCount === 1 ? '' : 's'} ready to review.`,
      data: { type: 'review_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 4, // 4 hours from now
    },
  });

  return id;
}

/**
 * Cancel the daily reminder notification.
 */
export async function cancelDailyReminder(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.type === 'daily_reminder') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get the current notification permission status.
 */
export async function getPermissionStatus(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}
