/**
 * theme/tokens.ts
 *
 * Single source of truth for all visual design tokens.
 * Every pixel, color and weight in the app flows from here.
 * Never hard-code values in component StyleSheets.
 */

import { TextStyle } from 'react-native';

// ─────────────────────────────────────────────────────────────
//  COLOR PALETTE  (raw values — use `colors` object in code)
// ─────────────────────────────────────────────────────────────

export const palette = {
  // Primary — soft rose
  rose50:  '#FFF0F3',
  rose100: '#FFE0E8',
  rose200: '#FFC1D1',
  rose300: '#FF94AE',
  rose400: '#FF5A82',
  rose500: '#F53D6B',   // ← primary CTA
  rose600: '#D6235A',
  rose700: '#A8183F',

  // Secondary — dusty mauve
  mauve50:  '#F9F0F9',
  mauve100: '#F1DCEF',
  mauve200: '#DDBCDB',
  mauve300: '#C290BF',
  mauve400: '#A367A1',  // ← secondary
  mauve500: '#7E4880',
  mauve600: '#5C3060',

  // Accent — warm peach
  peach50:  '#FFF4EE',
  peach100: '#FFE6D5',
  peach200: '#FFC9A8',
  peach300: '#FFA070',
  peach400: '#FF7A40',  // ← accent
  peach500: '#F05A1A',

  // Positive / fertile — sage green
  sage50:  '#F1F7F3',
  sage100: '#DCEFE3',
  sage200: '#AFDAC0',
  sage300: '#72C090',
  sage400: '#3DA468',   // ← fertile window
  sage500: '#228850',

  // Info blue
  sky100: '#DBEAFE',
  sky400: '#38BDF8',
  sky600: '#0284C7',

  // Neutrals
  white:   '#FFFFFF',
  black:   '#0A0A0A',
  gray50:  '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Semantic
  red400:    '#F87171',
  red500:    '#EF4444',
  red100:    '#FEE2E2',
  amber400:  '#FBBF24',
  amber100:  '#FEF3C7',
  green400:  '#4ADE80',
  green500:  '#22C55E',
  green100:  '#DCFCE7',
} as const;

// ─────────────────────────────────────────────────────────────
//  SEMANTIC COLOR MAP  (what to import in components)
// ─────────────────────────────────────────────────────────────

export const colors = {
  // Brand
  primary:          palette.rose500,
  primaryLight:     palette.rose100,
  primaryDark:      palette.rose600,
  primarySubtle:    palette.rose50,

  secondary:        palette.mauve400,
  secondaryLight:   palette.mauve100,
  secondaryDark:    palette.mauve600,
  secondarySubtle:  palette.mauve50,

  accent:           palette.peach400,
  accentLight:      palette.peach100,
  accentSubtle:     palette.peach50,

  fertile:          palette.sage400,
  fertileLight:     palette.sage100,
  fertileSubtle:    palette.sage50,

  // Backgrounds
  background:       '#FDFCFD',  // warm off-white
  backgroundAlt:    '#F7F3F8',  // faint mauve tint
  surface:          palette.white,
  surfaceAlt:       palette.gray50,
  surfaceRaised:    palette.white,

  // Text
  textPrimary:      palette.gray900,
  textSecondary:    palette.gray600,
  textTertiary:     palette.gray500,
  textDisabled:     palette.gray400,
  textInverse:      palette.white,
  textLink:         palette.rose500,

  // Borders
  border:           palette.gray200,
  borderLight:      palette.gray100,
  borderStrong:     palette.gray300,
  borderFocus:      palette.rose300,
  borderError:      palette.red500,

  // Semantic states
  error:            palette.red500,
  errorLight:       palette.red100,
  errorText:        '#B91C1C',

  warning:          palette.amber400,
  warningLight:     palette.amber100,
  warningText:      '#92400E',

  success:          palette.green500,
  successLight:     palette.green100,
  successText:      '#166534',

  info:             palette.sky600,
  infoLight:        palette.sky100,

  // Feature-specific (for phase indicators)
  phaseCycle:       palette.rose400,
  phasePregnancy:   palette.mauve400,
  phasePostpartum:  palette.peach400,

  // Navigation
  tabActive:        palette.rose500,
  tabInactive:      palette.gray400,
  tabBar:           palette.white,

  // Overlays
  overlay:          'rgba(10,10,10,0.45)',
  overlayLight:     'rgba(10,10,10,0.15)',
  shimmer:          palette.gray100,
} as const;

export type ColorKey = keyof typeof colors;

// ─────────────────────────────────────────────────────────────
//  TYPOGRAPHY
// ─────────────────────────────────────────────────────────────

/**
 * Font families.
 * At runtime, replace 'System' with loaded custom fonts:
 *   regular  → 'Nunito-Regular'
 *   medium   → 'Nunito-Medium'
 *   semiBold → 'Nunito-SemiBold'
 *   bold     → 'Nunito-Bold'
 */
export const fontFamily = {
  regular:   'System',
  medium:    'System',
  semiBold:  'System',
  bold:      'System',
  light:     'System',
} as const;

export const fontSize = {
  '2xs': 10,
  xs:    12,
  sm:    13,
  base:  15,
  md:    17,
  lg:    19,
  xl:    22,
  '2xl': 26,
  '3xl': 30,
  '4xl': 36,
  '5xl': 44,
} as const;

export type FontSizeKey = keyof typeof fontSize;

export const fontWeight = {
  light:     '300' as TextStyle['fontWeight'],
  regular:   '400' as TextStyle['fontWeight'],
  medium:    '500' as TextStyle['fontWeight'],
  semiBold:  '600' as TextStyle['fontWeight'],
  bold:      '700' as TextStyle['fontWeight'],
  extraBold: '800' as TextStyle['fontWeight'],
} as const;

export const lineHeight = {
  none:    1.0,
  tight:   1.2,
  snug:    1.35,
  normal:  1.5,
  relaxed: 1.65,
  loose:   1.85,
} as const;

export const letterSpacing = {
  tighter: -0.8,
  tight:   -0.4,
  normal:  0,
  wide:    0.4,
  wider:   0.8,
  widest:  1.5,
} as const;

// ─────────────────────────────────────────────────────────────
//  SPACING  (4-point grid)
// ─────────────────────────────────────────────────────────────

export const spacing = {
  0:    0,
  0.5:  2,
  1:    4,
  1.5:  6,
  2:    8,
  2.5:  10,
  3:    12,
  3.5:  14,
  4:    16,
  5:    20,
  6:    24,
  7:    28,
  8:    32,
  9:    36,
  10:   40,
  11:   44,
  12:   48,
  14:   56,
  16:   64,
  20:   80,
  24:   96,
  28:   112,
  32:   128,
} as const;

export type SpacingKey = keyof typeof spacing;

// ─────────────────────────────────────────────────────────────
//  BORDER RADIUS
// ─────────────────────────────────────────────────────────────

export const radius = {
  none:  0,
  xs:    4,
  sm:    8,
  md:    12,
  lg:    16,
  xl:    20,
  '2xl': 24,
  '3xl': 32,
  full:  9999,
} as const;

// ─────────────────────────────────────────────────────────────
//  SHADOWS
// ─────────────────────────────────────────────────────────────

export const shadows = {
  none: {
    shadowColor:  'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius:  0,
    elevation:     0,
  },
  xs: {
    shadowColor:   palette.gray900,
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius:  2,
    elevation:     1,
  },
  sm: {
    shadowColor:   palette.gray900,
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius:  6,
    elevation:     2,
  },
  md: {
    shadowColor:   palette.gray900,
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius:  12,
    elevation:     4,
  },
  lg: {
    shadowColor:   palette.gray900,
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.11,
    shadowRadius:  20,
    elevation:     8,
  },
  colored: {
    shadowColor:   palette.rose500,
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius:  12,
    elevation:     6,
  },
  coloredSm: {
    shadowColor:   palette.rose500,
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius:  6,
    elevation:     3,
  },
} as const;

// ─────────────────────────────────────────────────────────────
//  ANIMATION DURATIONS  (ms)
// ─────────────────────────────────────────────────────────────

export const duration = {
  instant:  80,
  fast:     150,
  normal:   250,
  slow:     380,
  slower:   550,
  page:     320,   // screen transitions
} as const;

// ─────────────────────────────────────────────────────────────
//  Z-INDEX
// ─────────────────────────────────────────────────────────────

export const zIndex = {
  base:    0,
  raised:  10,
  overlay: 100,
  modal:   200,
  toast:   300,
} as const;

// ─────────────────────────────────────────────────────────────
//  ICON SIZES
// ─────────────────────────────────────────────────────────────

export const iconSize = {
  xs:  14,
  sm:  18,
  md:  22,
  lg:  26,
  xl:  32,
  '2xl': 40,
} as const;

// ─────────────────────────────────────────────────────────────
//  CONSOLIDATED EXPORT
// ─────────────────────────────────────────────────────────────

export const tokens = {
  palette,
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  spacing,
  radius,
  shadows,
  duration,
  zIndex,
  iconSize,
} as const;

export type Tokens = typeof tokens;
