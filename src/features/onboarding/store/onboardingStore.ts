/**
 * features/onboarding/store/onboardingStore.ts
 *
 * Tracks the multi-step onboarding wizard state.
 * Persisted so the user can resume if they close the app mid-flow.
 *
 * Architecture note: this is a local feature-store, not a global one.
 * It is cleared after onboarding is completed.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { UserPhase } from '@types/models';
import { zustandMMKVStorage } from '@services/storage/StorageService';
import type {
  OnboardingStep,
  InitialProfileFormValues,
  PregnancySetupFormValues,
  PostpartumSetupFormValues,
} from '../types';

// ─────────────────────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────────────────────

interface OnboardingState {
  currentStep:   OnboardingStep;
  profile:       Partial<InitialProfileFormValues>;
  phase:         UserPhase | null;
  pregnancyData: Partial<PregnancySetupFormValues> | null;
  babyData:      Partial<PostpartumSetupFormValues> | null;

  actions: {
    setStep:           (step: OnboardingStep) => void;
    saveProfile:       (profile: InitialProfileFormValues) => void;
    savePhase:         (phase: UserPhase) => void;
    savePregnancyData: (data: PregnancySetupFormValues) => void;
    saveBabyData:      (data: PostpartumSetupFormValues) => void;
    reset:             () => void;
  };
}

const INITIAL_STATE = {
  currentStep:   'slides' as OnboardingStep,
  profile:       {},
  phase:         null,
  pregnancyData: null,
  babyData:      null,
};

// ─────────────────────────────────────────────────────────────
//  STORE
// ─────────────────────────────────────────────────────────────

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    immer((set) => ({
      ...INITIAL_STATE,

      actions: {
        setStep: (step) =>
          set((s) => { s.currentStep = step; }),

        saveProfile: (profile) =>
          set((s) => {
            s.profile     = profile;
            s.currentStep = 'journey';
          }),

        savePhase: (phase) =>
          set((s) => {
            s.phase = phase;
            if (phase === 'pregnancy')  s.currentStep = 'pregnancy_setup';
            else if (phase === 'postpartum') s.currentStep = 'postpartum_setup';
            else s.currentStep = 'complete';
          }),

        savePregnancyData: (data) =>
          set((s) => {
            s.pregnancyData = data;
            s.currentStep   = 'complete';
          }),

        saveBabyData: (data) =>
          set((s) => {
            s.babyData    = data;
            s.currentStep = 'complete';
          }),

        reset: () =>
          set((s) => {
            Object.assign(s, INITIAL_STATE);
          }),
      },
    })),
    {
      name:    'store/onboarding',
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (s) => ({
        currentStep:   s.currentStep,
        profile:       s.profile,
        phase:         s.phase,
        pregnancyData: s.pregnancyData,
        babyData:      s.babyData,
      }),
    }
  )
);

// Selectors
export const selectOnboardingActions = (s: OnboardingState) => s.actions;
export const selectOnboardingPhase   = (s: OnboardingState) => s.phase;
export const selectOnboardingProfile = (s: OnboardingState) => s.profile;
