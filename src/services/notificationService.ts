import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');
type DeviceModule = typeof import('expo-device');

let _notifications: NotificationsModule | null = null;
let _device: DeviceModule | null = null;
let _initialized = false;

function getModules(): { Notifications: NotificationsModule; Device: DeviceModule } | null {
  if (Platform.OS === 'web') return null;

  if (!_initialized) {
    _initialized = true;
    _notifications = require('expo-notifications') as NotificationsModule;
    _device = require('expo-device') as DeviceModule;

    _notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  return _notifications && _device
    ? { Notifications: _notifications, Device: _device }
    : null;
}

/**
 * Request push notification permissions.
 * Returns the Expo push token if granted.
 */
export async function requestPermissions(): Promise<string | null> {
  const mods = getModules();
  if (!mods) return null;
  const { Notifications, Device } = mods;

  if (!Device.isDevice) {
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
  const mods = getModules();
  if (!mods) return '';
  const { Notifications } = mods;

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
  const mods = getModules();
  if (!mods) return '';
  const { Notifications } = mods;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${streakDays}-day streak at risk!`,
      body: "You haven't studied today. Open Lango to keep your streak alive!",
      data: { type: 'streak_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 20,
    },
  });

  return id;
}

/**
 * Schedule a review reminder when cards are due.
 */
export async function scheduleReviewReminder(dueCount: number): Promise<string> {
  const mods = getModules();
  if (!mods) return '';
  const { Notifications } = mods;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Review cards waiting!',
      body: `You have ${dueCount} flashcard${dueCount === 1 ? '' : 's'} ready to review.`,
      data: { type: 'review_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 4,
    },
  });

  return id;
}

/**
 * Cancel the daily reminder notification.
 */
export async function cancelDailyReminder(): Promise<void> {
  const mods = getModules();
  if (!mods) return;
  const { Notifications } = mods;

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
  const mods = getModules();
  if (!mods) return;

  await mods.Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get the current notification permission status.
 */
export async function getPermissionStatus(): Promise<boolean> {
  const mods = getModules();
  if (!mods) return false;

  const { status } = await mods.Notifications.getPermissionsAsync();
  return status === 'granted';
}
