import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: 'lango:user',
  PROGRESS: (courseId: string) => `lango:progress:${courseId}`,
  VOCAB: (courseId: string) => `lango:vocab:${courseId}`,
  ACHIEVEMENTS: 'lango:achievements',
  DAILY_GOAL: 'lango:daily_goal',
  SETTINGS: 'lango:settings',
  CLAUDE_API_KEY: 'lango:claude_api_key',
  HAS_SEEN_WELCOME: 'lango:has_seen_welcome',
};

// Generic save/load helpers
async function save<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Silently fail — data will be re-fetched from mock service
  }
}

async function load<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}

// User profile
export async function saveUser(user: any): Promise<void> {
  await save(KEYS.USER, user);
}

export async function loadUser(): Promise<any | null> {
  return load(KEYS.USER);
}

export async function clearUser(): Promise<void> {
  await remove(KEYS.USER);
}

// Progress
export async function saveProgress(courseId: string, progress: any): Promise<void> {
  await save(KEYS.PROGRESS(courseId), progress);
}

export async function loadProgress(courseId: string): Promise<any | null> {
  return load(KEYS.PROGRESS(courseId));
}

// Vocabulary cards
export async function saveVocabCards(courseId: string, cards: any[]): Promise<void> {
  await save(KEYS.VOCAB(courseId), cards);
}

export async function loadVocabCards(courseId: string): Promise<any[] | null> {
  return load(KEYS.VOCAB(courseId));
}

// Achievements
export async function saveAchievements(achievements: any[]): Promise<void> {
  await save(KEYS.ACHIEVEMENTS, achievements);
}

export async function loadAchievements(): Promise<any[] | null> {
  return load(KEYS.ACHIEVEMENTS);
}

// Daily goal
export async function saveDailyGoal(goal: any): Promise<void> {
  await save(KEYS.DAILY_GOAL, goal);
}

export async function loadDailyGoal(): Promise<any | null> {
  return load(KEYS.DAILY_GOAL);
}

// Settings
export interface AppSettings {
  notifications: boolean;
  dailyLessonsTarget: number;
  dailyReviewsTarget: number;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await save(KEYS.SETTINGS, settings);
}

export async function loadSettings(): Promise<AppSettings | null> {
  return load(KEYS.SETTINGS);
}

// Welcome screen flag
export async function setHasSeenWelcome(): Promise<void> {
  await save(KEYS.HAS_SEEN_WELCOME, true);
}

export async function getHasSeenWelcome(): Promise<boolean> {
  const seen = await load<boolean>(KEYS.HAS_SEEN_WELCOME);
  return seen === true;
}

// Claude API key (stored locally, never sent to any backend)
export async function saveApiKey(key: string): Promise<void> {
  await save(KEYS.CLAUDE_API_KEY, key);
}

export async function loadApiKey(): Promise<string | null> {
  return load(KEYS.CLAUDE_API_KEY);
}

export async function clearApiKey(): Promise<void> {
  await remove(KEYS.CLAUDE_API_KEY);
}

// Clear all app data
export async function clearAllData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const langoKeys = keys.filter((k) => k.startsWith('lango:'));
    if (langoKeys.length > 0) {
      await AsyncStorage.multiRemove(langoKeys);
    }
  } catch {
    // Silently fail
  }
}
