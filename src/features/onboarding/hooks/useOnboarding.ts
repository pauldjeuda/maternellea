/**
 * features/onboarding/hooks/useOnboarding.ts
 *
 * Drives the onboarding wizard.
 * On completion, commits collected data to the global auth store
 * and triggers navigation to the main app.
 */

import { useCallback } from 'react';
import { addDays, format, parseISO, differenceInDays } from 'date-fns';

import { useAuthStore, selectAuthActions } from '@store/authStore';
import { UserPhase, PregnancyProfile, BabyProfile } from '@types/models';
import { PREGNANCY } from '@constants';

import { useOnboardingStore, selectOnboardingActions } from '../store/onboardingStore';
import type {
  InitialProfileFormValues,
  PregnancySetupFormValues,
  PostpartumSetupFormValues,
} from '../types';

// ─────────────────────────────────────────────────────────────
//  PREGNANCY CALCULATOR
// ─────────────────────────────────────────────────────────────

function buildPregnancyProfile(data: PregnancySetupFormValues): Omit<PregnancyProfile, 'userId'> {
  let lmpDate: string;
  let currentWeek: number;

  if (data.entryMethod === 'lmp' && data.lmpDate) {
    lmpDate     = data.lmpDate;
    const days  = differenceInDays(new Date(), parseISO(lmpDate));
    currentWeek = Math.floor(days / 7);
  } else {
    // back-calculate LMP from week
    const week  = data.currentWeek ?? 1;
    currentWeek = week;
    lmpDate     = format(addDays(new Date(), -(week * 7)), 'yyyy-MM-dd');
  }

  const lmpParsed  = parseISO(lmpDate);
  const dueDate    = format(addDays(lmpParsed, PREGNANCY.DAYS), 'yyyy-MM-dd');
  const currentDay = differenceInDays(new Date(), parseISO(lmpDate)) % 7;
  const trimester  =
    currentWeek <= PREGNANCY.TRIMESTER_1_END ? 1 :
    currentWeek <= PREGNANCY.TRIMESTER_2_END ? 2 : 3;

  return {
    id:          `preg_${Date.now()}`,
    lmpDate,
    dueDate,
    currentWeek: Math.min(currentWeek, 40),
    currentDay,
    trimester:   trimester as 1 | 2 | 3,
    isActive:    true,
    createdAt:   new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
//  HOOK
// ─────────────────────────────────────────────────────────────

export function useOnboarding() {
  const { updateUser, setActivePhase, completeOnboarding } = useAuthStore(selectAuthActions);
  const onboardingActions = useOnboardingStore(selectOnboardingActions);

  // ── Step: save profile ──────────────────────────────────────

  const saveProfile = useCallback((values: InitialProfileFormValues) => {
    onboardingActions.saveProfile(values);
    // Immediately update the global user profile
    updateUser({
      firstName:   values.firstName,
      dateOfBirth: values.dateOfBirth,
      country:     values.country,
    });
  }, [onboardingActions, updateUser]);

  // ── Step: choose phase ──────────────────────────────────────

  const savePhase = useCallback((phase: UserPhase) => {
    onboardingActions.savePhase(phase);
    setActivePhase(phase);
  }, [onboardingActions, setActivePhase]);

  // ── Step: pregnancy setup ───────────────────────────────────

  const savePregnancySetup = useCallback((values: PregnancySetupFormValues) => {
    onboardingActions.savePregnancyData(values);
    // Store the computed pregnancy profile in the user metadata
    // (In production this would be saved to a dedicated pregnancyStore)
    const pregnancy = buildPregnancyProfile(values);
    updateUser({ activePhase: 'pregnancy' });
    // Return for the screen to hand off to pregnancyStore
    return pregnancy;
  }, [onboardingActions, updateUser]);

  // ── Step: postpartum / baby setup ───────────────────────────

  const savePostpartumSetup = useCallback((values: PostpartumSetupFormValues): BabyProfile => {
    onboardingActions.saveBabyData(values);
    updateUser({ activePhase: 'postpartum' });

    const baby: BabyProfile = {
      id:                `baby_${Date.now()}`,
      name:              values.babyName,
      birthDate:         values.birthDate,
      gender:            values.gender,
      birthWeightGrams:  values.birthWeightGrams ? parseInt(values.birthWeightGrams, 10) : undefined,
      birthHeightCm:     values.birthHeightCm   ? parseFloat(values.birthHeightCm)      : undefined,
      isActive:          true,
      createdAt:         new Date().toISOString(),
    };

    return baby;
  }, [onboardingActions, updateUser]);

  // ── Finalize ────────────────────────────────────────────────

  const finalize = useCallback(() => {
    completeOnboarding();
    onboardingActions.reset(); // clear wizard cache
  }, [completeOnboarding, onboardingActions]);

  return {
    saveProfile,
    savePhase,
    savePregnancySetup,
    savePostpartumSetup,
    finalize,
  };
}
