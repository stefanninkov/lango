import { Platform } from 'react-native';

// On web (GitHub Pages), always use mock services since there's no Firebase backend.
// On native, set to false when Firebase is configured and available.
export const USE_MOCK = Platform.OS === 'web' ? true : false;
