const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Block expo-notifications and expo-device from being bundled on web.
// expo-notifications uses localStorage at module init which crashes SSR.
const BLOCKED_ON_WEB = ['expo-notifications', 'expo-device'];

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && BLOCKED_ON_WEB.some((m) => moduleName === m || moduleName.startsWith(m + '/'))) {
    return { type: 'empty' };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
