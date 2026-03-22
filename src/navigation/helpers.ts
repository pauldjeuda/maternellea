/**
 * navigation/helpers.ts
 *
 * Pure utility functions for navigation.
 * No React hooks — safe to call outside components.
 */

import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParams } from '@types/navigation';
import { UserPhase } from '@types/models';

// ─────────────────────────────────────────────────────────────
//  NAVIGATION REF
//  Allows imperative navigation outside React tree
//  (e.g. from a notification handler or service).
// ─────────────────────────────────────────────────────────────

export const navigationRef = createNavigationContainerRef<RootStackParams>();

export function navigateTo(name: keyof RootStackParams) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any);
  }
}

// ─────────────────────────────────────────────────────────────
//  TAB LABEL / ICON  (centralised so tab bar + deep links agree)
// ─────────────────────────────────────────────────────────────

export const TAB_META = {
  HomeTab:     { label: 'Accueil',     emoji: 'home'     },
  CalendarTab: { label: 'Calendrier',  emoji: 'calendar' },
  TrackingTab: { label: 'Suivi',       emoji: 'tracking' },
  AdviceTab:   { label: 'Conseils',    emoji: 'advice'   },
  ProfileTab:  { label: 'Profil',      emoji: 'profile'  },
} as const;

export type TabName = keyof typeof TAB_META;

// ─────────────────────────────────────────────────────────────
//  PHASE → TRACKING STACK  (determines which stack renders)
// ─────────────────────────────────────────────────────────────

export function getTrackingStackForPhase(phase: UserPhase) {
  return {
    cycle:      'CycleStack',
    pregnancy:  'PregnancyStack',
    postpartum: 'PostpartumStack',
  }[phase] as 'CycleStack' | 'PregnancyStack' | 'PostpartumStack';
}

// ─────────────────────────────────────────────────────────────
//  HEADER OPTIONS PRESETS
// ─────────────────────────────────────────────────────────────

import { tokens } from '@theme/tokens';

const { colors, fontWeight, fontSize } = tokens;

/** Standard stack header — clean, no shadow */
export const defaultHeaderOptions = {
  headerStyle:        { backgroundColor: colors.background },
  headerTintColor:    colors.textPrimary,
  headerTitleStyle:   { fontWeight: fontWeight.semiBold, fontSize: fontSize.md },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
} as const;

/** Header with subtle bottom border */
export const borderedHeaderOptions = {
  ...defaultHeaderOptions,
  headerShadowVisible: true,
  headerStyle: {
    backgroundColor: colors.surface,
  },
} as const;

/** Transparent overlay header (used on splash / hero screens) */
export const transparentHeaderOptions = {
  headerTransparent:     true,
  headerTitle:           '',
  headerTintColor:       colors.textPrimary,
  headerBackTitleVisible: false,
} as const;
