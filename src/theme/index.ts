/**
 * theme/index.ts
 * Public API for the theme system.
 *
 * Usage in components:
 *   import { useTheme } from '@theme';
 *   const { colors, spacing, radius } = useTheme();
 *
 * Or for static usage outside React:
 *   import { tokens } from '@theme';
 */

export { tokens, colors, spacing, radius, fontSize, fontWeight,
         fontFamily, shadows, duration, zIndex, iconSize,
         palette, lineHeight, letterSpacing } from './tokens';

export type { Tokens, ColorKey, FontSizeKey, SpacingKey } from './tokens';

export { useTheme } from './ThemeContext';
export { ThemeProvider } from '../providers/ThemeProvider';

// ─── Styled text presets ─────────────────────────────────────
// Pre-composed TextStyle objects for consistent typography.

import { TextStyle } from 'react-native';
import { fontSize, fontWeight, lineHeight, colors } from './tokens';

export const textPresets = {
  h1: {
    fontSize:   fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    color:      colors.textPrimary,
    letterSpacing: -0.8,
  } satisfies TextStyle,

  h2: {
    fontSize:   fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['3xl'] * lineHeight.tight,
    color:      colors.textPrimary,
    letterSpacing: -0.5,
  } satisfies TextStyle,

  h3: {
    fontSize:   fontSize['2xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['2xl'] * lineHeight.snug,
    color:      colors.textPrimary,
  } satisfies TextStyle,

  h4: {
    fontSize:   fontSize.xl,
    fontWeight: fontWeight.semiBold,
    lineHeight: fontSize.xl * lineHeight.snug,
    color:      colors.textPrimary,
  } satisfies TextStyle,

  h5: {
    fontSize:   fontSize.lg,
    fontWeight: fontWeight.semiBold,
    lineHeight: fontSize.lg * lineHeight.normal,
    color:      colors.textPrimary,
  } satisfies TextStyle,

  body: {
    fontSize:   fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.base * lineHeight.relaxed,
    color:      colors.textPrimary,
  } satisfies TextStyle,

  bodySm: {
    fontSize:   fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.relaxed,
    color:      colors.textPrimary,
  } satisfies TextStyle,

  label: {
    fontSize:   fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.snug,
    color:      colors.textPrimary,
    letterSpacing: 0.3,
  } satisfies TextStyle,

  caption: {
    fontSize:   fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.xs * lineHeight.normal,
    color:      colors.textTertiary,
  } satisfies TextStyle,

  overline: {
    fontSize:      fontSize['2xs'],
    fontWeight:    fontWeight.semiBold,
    lineHeight:    fontSize['2xs'] * lineHeight.normal,
    color:         colors.textTertiary,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase' as const,
  } satisfies TextStyle,

  link: {
    fontSize:   fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.base * lineHeight.normal,
    color:      colors.textLink,
  } satisfies TextStyle,
} as const;

import { letterSpacing } from './tokens';

export type TextPreset = keyof typeof textPresets;
