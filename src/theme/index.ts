import { MD3DarkTheme, configureFonts } from 'react-native-paper';
import { Platform, StyleSheet } from 'react-native';

// Lango Dark & Premium color palette
export const colors = {
  background: '#0D0D12',
  surface: '#1A1A24',
  surfaceElevated: '#242436',
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  secondary: '#00D9A6',
  accent: '#FF6B8A',
  warning: '#FFB84D',
  textPrimary: '#EEEEF0',
  textSecondary: '#9898A6',
  textMuted: '#5C5C6E',
  border: '#2A2A3C',
  gold: '#FFD700',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border radius
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Typography styles
export const typography = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '600', color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 16, fontWeight: '400', color: colors.textPrimary },
  bodySmall: { fontSize: 14, fontWeight: '400', color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  button: { fontSize: 16, fontWeight: '600', color: colors.white },
  target: { fontSize: 20, fontWeight: '500', color: colors.textPrimary },
  native: { fontSize: 16, fontWeight: '400', color: colors.textSecondary },
});

// Web-specific styles for interactive elements
export const webStyles = Platform.OS === 'web'
  ? StyleSheet.create({
      pressable: {
        // @ts-ignore — web-only property
        cursor: 'pointer',
        // @ts-ignore
        transition: 'opacity 0.15s ease',
        // @ts-ignore
        userSelect: 'none',
      },
      card: {
        // @ts-ignore
        cursor: 'pointer',
        // @ts-ignore
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      },
    })
  : StyleSheet.create({
      pressable: {},
      card: {},
    });

// React Native Paper theme (MD3 Dark)
export const theme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.surfaceElevated,
    tertiary: colors.accent,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceElevated,
    error: colors.accent,
    onPrimary: colors.white,
    onSecondary: colors.black,
    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    elevation: {
      level0: colors.background,
      level1: colors.surface,
      level2: colors.surfaceElevated,
      level3: colors.surfaceElevated,
      level4: colors.surfaceElevated,
      level5: colors.surfaceElevated,
    },
  },
};
