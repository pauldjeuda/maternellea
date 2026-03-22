/**
 * navigation/hooks/useAppNavigation.ts
 *
 * Typed navigation hooks so screens never need to import
 * and re-specify the full generic themselves.
 *
 * Usage:
 *   const nav = useCycleNavigation();
 *   nav.navigate('AddPeriod', { entryId: undefined });
 */

import { useNavigation } from '@react-navigation/native';
import type {
  AuthNavProp,
  OnboardingNavProp,
  MainTabNavProp,
  HomeNavProp,
  CalendarNavProp,
  CycleNavProp,
  PregnancyNavProp,
  PostpartumNavProp,
  AdviceNavProp,
  ProfileNavProp,
  RootNavProp,
} from '@types/navigation';

export const useRootNavigation       = () => useNavigation<RootNavProp>();
export const useAuthNavigation       = () => useNavigation<AuthNavProp>();
export const useOnboardingNavigation = () => useNavigation<OnboardingNavProp>();
export const useTabNavigation        = () => useNavigation<MainTabNavProp>();
export const useHomeNavigation       = () => useNavigation<HomeNavProp>();
export const useCalendarNavigation   = () => useNavigation<CalendarNavProp>();
export const useCycleNavigation      = () => useNavigation<CycleNavProp>();
export const usePregnancyNavigation  = () => useNavigation<PregnancyNavProp>();
export const usePostpartumNavigation = () => useNavigation<PostpartumNavProp>();
export const useAdviceNavigation     = () => useNavigation<AdviceNavProp>();
export const useProfileNavigation    = () => useNavigation<ProfileNavProp>();
