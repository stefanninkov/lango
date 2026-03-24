const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prevent expo-notifications and expo-device from being bundled on web.
// These packages use native APIs (like localStorage in SSR) that crash
// during server-side rendering with expo-router.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === 'web' &&
    (moduleName === 'expo-notifications' || moduleName === 'expo-device')
  ) {
    return {
      type: 'empty',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
