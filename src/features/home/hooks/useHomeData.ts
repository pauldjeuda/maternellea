/**
 * features/home/hooks/useHomeData.ts
 *
 * Single hook consumed by HomeScreen.
 * Reads from all relevant stores, seeds mock data on first use,
 * and exposes a clean, typed object per phase.
 *
 * The screen never touches stores directly — it only calls this hook.
 */

import { useEffect } from 'react';

import { useAuthStore, selectUser }               from '@store/authStore';
import { useCycleStore }                          from '@store/cycleStore';
import { usePregnancyStore, selectNextAppointment } from '@store/pregnancyStore';
import { useBabyStore }                           from '@store/babyStore';

import {
  MOCK_CYCLE_ENTRIES, MOCK_SYMPTOMS, MOCK_CYCLE_PREDICTION,
  MOCK_WEEKLY_CONTENT, MOCK_CHECKLIST, MOCK_ARTICLES,
} from '@services/mocks/dashboardData';

import { getBabyAge, pregnancyProgressPct, weeksAndDaysLabel, daysUntil } from '@utils/date';
import type { UserPhase } from '@types/models';

// ─────────────────────────────────────────────────────────────
//  RETURN TYPES PER PHASE
// ─────────────────────────────────────────────────────────────

export interface CycleHomeData {
  phase:           'cycle';
  firstName:       string;
  prediction:      ReturnType<typeof useCycleStore.getState>['prediction'];
  recentSymptoms:  ReturnType<typeof useCycleStore.getState>['symptoms'];
  cycleEntries:    ReturnType<typeof useCycleStore.getState>['entries'];
  tipArticle:      (typeof MOCK_ARTICLES)[0];
}

export interface PregnancyHomeData {
  phase:          'pregnancy';
  firstName:      string;
  pregnancy:      ReturnType<typeof usePregnancyStore.getState>['pregnancy'];
  progressPct:    number;
  weekLabel:      string;
  nextAppointment: ReturnType<typeof usePregnancyStore.getState>['appointments'][0] | null;
  weeklyContent:  typeof MOCK_WEEKLY_CONTENT;
  checklist:      typeof MOCK_CHECKLIST;
  tipArticle:     (typeof MOCK_ARTICLES)[0];
}

export interface PostpartumHomeData {
  phase:         'postpartum';
  firstName:     string;
  baby:          ReturnType<typeof useBabyStore.getState>['babies'][0] | null;
  babyAge:       ReturnType<typeof getBabyAge> | null;
  latestGrowth:  ReturnType<typeof useBabyStore.getState>['growthEntries'][0] | null;
  nextVaccine:   ReturnType<typeof useBabyStore.getState>['vaccineRecords'][0] | null;
  recentMood:    ReturnType<typeof useBabyStore.getState>['postpartumEntries'][0] | null;
  tipArticle:    (typeof MOCK_ARTICLES)[0];
}

export type HomeData = CycleHomeData | PregnancyHomeData | PostpartumHomeData;

// ─────────────────────────────────────────────────────────────
//  HOOK
// ─────────────────────────────────────────────────────────────

export function useHomeData(): HomeData {
  const user  = useAuthStore(selectUser);
  const phase = (user?.activePhase ?? 'cycle') as UserPhase;

  // ── Stores ──────────────────────────────────────────────────
  const cycleEntries  = useCycleStore(s => s.entries);
  const symptoms      = useCycleStore(s => s.symptoms);
  const prediction    = useCycleStore(s => s.prediction);
  const cycleActions  = useCycleStore(s => s.actions);

  const pregnancy     = usePregnancyStore(s => s.pregnancy);
  const pregActions   = usePregnancyStore(s => s.actions);
  const nextAppt      = usePregnancyStore(selectNextAppointment);

  const babies        = useBabyStore(s => s.babies);
  const babyActions   = useBabyStore(s => s.actions);

  // ── Seed on first load ──────────────────────────────────────
  useEffect(() => {
    if (phase === 'cycle' && cycleEntries.length === 0) {
      cycleActions.seed(MOCK_CYCLE_ENTRIES, MOCK_SYMPTOMS);
    }
    if (phase === 'pregnancy') {
      pregActions.seed();
    }
    if (phase === 'postpartum') {
      babyActions.seed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const firstName = user?.firstName ?? 'vous';

  // ── CYCLE ───────────────────────────────────────────────────
  if (phase === 'cycle') {
    const recentSymptoms = [...symptoms]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);

    return {
      phase,
      firstName,
      prediction:     prediction ?? MOCK_CYCLE_PREDICTION,
      recentSymptoms,
      cycleEntries,
      tipArticle:     MOCK_ARTICLES[0]!,
    } satisfies CycleHomeData;
  }

  // ── PREGNANCY ───────────────────────────────────────────────
  if (phase === 'pregnancy') {
    const preg       = pregnancy;
    const progressPct = preg ? pregnancyProgressPct(preg.currentWeek) : 0;
    const weekLabel  = preg ? weeksAndDaysLabel(preg.currentWeek, preg.currentDay) : '—';

    return {
      phase,
      firstName,
      pregnancy:      preg,
      progressPct,
      weekLabel,
      nextAppointment: nextAppt,
      weeklyContent:  MOCK_WEEKLY_CONTENT,
      checklist:      MOCK_CHECKLIST,
      tipArticle:     MOCK_ARTICLES[1]!,
    } satisfies PregnancyHomeData;
  }

  // ── POSTPARTUM ──────────────────────────────────────────────
  const baby = babies.find(b => b.isActive) ?? null;
  const babyAge     = baby ? getBabyAge(baby.birthDate) : null;
  const latestGrowth = baby ? (babyActions.getLatestGrowth(baby.id) ?? null) : null;
  const nextVaccine  = baby ? (babyActions.getNextVaccine(baby.id) ?? null) : null;
  const recentMood   = useBabyStore.getState().postpartumEntries
    .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;

  return {
    phase,
    firstName,
    baby,
    babyAge,
    latestGrowth,
    nextVaccine,
    recentMood,
    tipArticle: MOCK_ARTICLES[2]!,
  } satisfies PostpartumHomeData;
}
