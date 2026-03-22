/**
 * types/navigation.ts
 *
 * Complete type-safe navigation contract for Maternellea.
 *
 * Convention
 * ──────────
 *   Stack param lists  → *StackParams
 *   Tab param list     → MainTabParams
 *   Root param list    → RootStackParams
 *
 * Usage in a screen
 * ──────────────────
 *   import type { CycleScreenProps } from '@types/navigation';
 *
 *   export function AddPeriodScreen({ navigation, route }: CycleScreenProps<'AddPeriod'>) { … }
 *
 * Or with hooks:
 *   const nav   = useNavigation<CycleNavProp>();
 *   const route = useRoute<RouteProp<CycleStackParams, 'AddPeriod'>>();
 */

import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import type {
  BottomTabNavigationProp,
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';

// ─────────────────────────────────────────────────────────────
//  ROOT
// ─────────────────────────────────────────────────────────────

export type RootStackParams = {
  Splash:     undefined;
  Auth:       undefined;
  Onboarding: undefined;
  MainTabs:   undefined;
};

// ─────────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────────

export type AuthStackParams = {
  Welcome:        undefined;
  Login:          undefined;
  Register:       undefined;
  ForgotPassword: undefined;
};

// ─────────────────────────────────────────────────────────────
//  ONBOARDING
// ─────────────────────────────────────────────────────────────

export type OnboardingStackParams = {
  OnboardingSlides: undefined;
  UserSetup:        undefined;
  PhaseSelection:   undefined;
  PregnancySetup:   undefined;
  BabySetup:        undefined;
};

// ─────────────────────────────────────────────────────────────
//  MAIN TABS
// ─────────────────────────────────────────────────────────────

export type MainTabParams = {
  HomeTab:     undefined;
  CalendarTab: undefined;
  TrackingTab: undefined;
  AdviceTab:   undefined;
  ProfileTab:  undefined;
};

// ─────────────────────────────────────────────────────────────
//  HOME TAB STACK
// ─────────────────────────────────────────────────────────────

export type HomeStackParams = {
  HomeDashboard: undefined;
};

// ─────────────────────────────────────────────────────────────
//  CALENDAR TAB STACK
// ─────────────────────────────────────────────────────────────

export type CalendarStackParams = {
  CalendarMain: undefined;
  EventDetail: {
    entityId:   string;
    entityType: 'appointment' | 'period' | 'vaccine' | 'exam';
  };
};

// ─────────────────────────────────────────────────────────────
//  TRACKING TAB — three phase stacks
// ─────────────────────────────────────────────────────────────

export type CycleStackParams = {
  CycleDashboard:   undefined;
  AddPeriod:        { entryId?: string };
  EditPeriod:       { entryId: string };
  AddSymptoms:      { date: string };
  EditSymptoms:     { entryId: string };
  CycleHistory:     undefined;
  CyclePredictions: undefined;
  DayDetail:        { date: string };
};

export type PregnancyStackParams = {
  PregnancyDashboard: undefined;
  WeekDetail:         { week: number };
  Appointments:       undefined;
  AddAppointment:     { appointmentId?: string };
  EditAppointment:    { appointmentId: string };
  MedicalExams:       undefined;
  AddExam:            { examId?: string };
  EditExam:           { examId: string };
  PregnancyJournal:   undefined;
  AddJournalEntry:    { entryId?: string };
  EditJournalEntry:   { entryId: string };
  WeightTracking:     undefined;
  PregnancyChecklist: undefined;
  PregnancyTimeline:  undefined;
};

export type PostpartumStackParams = {
  PostpartumDashboard:    undefined;
  AddPostpartumEntry:     { entryId?: string };
  PostpartumJournal:      undefined;
  PostpartumAppointments: undefined;
  AddPostpartumAppt:      { appointmentId?: string };
  BabyDashboard:          { babyId: string };
  EditBabyProfile:        { babyId: string };
  GrowthTracking:         { babyId: string };
  AddGrowthEntry:         { babyId: string; entryId?: string };
  EditGrowthEntry:        { babyId: string; entryId: string };
  VaccineCalendar:        { babyId: string };
  VaccineDetail:          { recordId: string; babyId: string };
  VaccineHistory:         { babyId: string };
  MarkVaccineDone:        { recordId: string; babyId: string };
};

// ─────────────────────────────────────────────────────────────
//  ADVICE TAB STACK
// ─────────────────────────────────────────────────────────────

export type AdviceStackParams = {
  AdviceList:   undefined;
  AdviceDetail: { articleId: string };
  AdviceSearch: undefined;
  Favorites:    undefined;
};

// ─────────────────────────────────────────────────────────────
//  PROFILE TAB STACK
// ─────────────────────────────────────────────────────────────

export type ProfileStackParams = {
  ProfileHome:       undefined;
  EditProfile:       undefined;
  Preferences:       undefined;
  NotificationPrefs: undefined;
  ChangePhase:       undefined;
  Privacy:           undefined;
  About:             undefined;
};

// ─────────────────────────────────────────────────────────────
//  NAVIGATION PROP ALIASES
//  Import these instead of constructing the full generic each time.
// ─────────────────────────────────────────────────────────────

export type RootNavProp       = NativeStackNavigationProp<RootStackParams>;
export type AuthNavProp       = NativeStackNavigationProp<AuthStackParams>;
export type OnboardingNavProp = NativeStackNavigationProp<OnboardingStackParams>;
export type MainTabNavProp    = BottomTabNavigationProp<MainTabParams>;
export type HomeNavProp       = NativeStackNavigationProp<HomeStackParams>;
export type CalendarNavProp   = NativeStackNavigationProp<CalendarStackParams>;
export type CycleNavProp      = NativeStackNavigationProp<CycleStackParams>;
export type PregnancyNavProp  = NativeStackNavigationProp<PregnancyStackParams>;
export type PostpartumNavProp = NativeStackNavigationProp<PostpartumStackParams>;
export type AdviceNavProp     = NativeStackNavigationProp<AdviceStackParams>;
export type ProfileNavProp    = NativeStackNavigationProp<ProfileStackParams>;

// Composite: navigation prop for a screen inside a stack tab
// e.g. a cycle screen that can also navigate to tab root
export type CycleTabNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<CycleStackParams>,
  BottomTabNavigationProp<MainTabParams>
>;

// ─────────────────────────────────────────────────────────────
//  SCREEN PROPS ALIASES
//  Use when a screen needs both navigation AND route params.
//
//  function AddPeriodScreen({ navigation, route }: CycleScreenProps<'AddPeriod'>) {}
// ─────────────────────────────────────────────────────────────

export type HomeScreenProps<T extends keyof HomeStackParams>             = NativeStackScreenProps<HomeStackParams, T>;
export type CalendarScreenProps<T extends keyof CalendarStackParams>     = NativeStackScreenProps<CalendarStackParams, T>;
export type CycleScreenProps<T extends keyof CycleStackParams>           = NativeStackScreenProps<CycleStackParams, T>;
export type PregnancyScreenProps<T extends keyof PregnancyStackParams>   = NativeStackScreenProps<PregnancyStackParams, T>;
export type PostpartumScreenProps<T extends keyof PostpartumStackParams> = NativeStackScreenProps<PostpartumStackParams, T>;
export type AdviceScreenProps<T extends keyof AdviceStackParams>         = NativeStackScreenProps<AdviceStackParams, T>;
export type ProfileScreenProps<T extends keyof ProfileStackParams>       = NativeStackScreenProps<ProfileStackParams, T>;
export type AuthScreenProps<T extends keyof AuthStackParams>             = NativeStackScreenProps<AuthStackParams, T>;
export type OnboardingScreenProps<T extends keyof OnboardingStackParams> = NativeStackScreenProps<OnboardingStackParams, T>;

// ─────────────────────────────────────────────────────────────
//  GLOBAL AUGMENTATION
//  Enables useNavigation() without explicit generics.
// ─────────────────────────────────────────────────────────────

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParams {}
  }
}
