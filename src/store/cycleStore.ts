/**
 * store/cycleStore.ts
 * All menstrual cycle state, symptom entries, and predictions.
 * Business logic (prediction algorithm) lives in cycleStore, not in screens.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import {
  CycleEntry, SymptomEntry, CyclePrediction,
  FlowIntensity, SymptomType, MoodLevel, FatigueLevel, PainLevel,
} from '@types/models';
import { STORAGE_KEYS, CYCLE } from '@constants';
import { zustandMMKVStorage } from '@services/storage/StorageService';
import {
  addDays, parseISO, differenceInDays, format,
} from 'date-fns';

// ─────────────────────────────────────────────────────────────
//  PREDICTION ALGORITHM
// ─────────────────────────────────────────────────────────────

function computePrediction(entries: CycleEntry[]): CyclePrediction | null {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort(
    (a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime()
  );

  // Average cycle length from inter-period gaps
  let avgCycleLength = CYCLE.DEFAULT_LENGTH_DAYS;
  if (sorted.length >= 2) {
    const gaps = sorted.slice(0, -1).map((entry, i) => {
      const next = sorted[i + 1]!;
      return differenceInDays(parseISO(entry.startDate), parseISO(next.startDate));
    }).filter(g => g >= CYCLE.MIN_LENGTH_DAYS && g <= CYCLE.MAX_LENGTH_DAYS);
    if (gaps.length > 0) {
      avgCycleLength = Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length);
    }
  }

  // Average period duration
  const durations = sorted
    .filter(e => e.endDate)
    .map(e => differenceInDays(parseISO(e.endDate!), parseISO(e.startDate)) + 1);
  const avgPeriodLength = durations.length > 0
    ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
    : CYCLE.DEFAULT_PERIOD_DAYS;

  // Confidence
  const confidence: CyclePrediction['confidence'] =
    sorted.length >= CYCLE.MIN_CYCLES_FOR_HIGH_CONFIDENCE ? 'high'
    : sorted.length >= CYCLE.MIN_CYCLES_FOR_MED_CONFIDENCE ? 'medium'
    : 'low';

  const lastStart       = parseISO(sorted[0]!.startDate);
  const nextStart       = addDays(lastStart, avgCycleLength);
  const nextEnd         = addDays(nextStart, avgPeriodLength - 1);
  const ovulation       = addDays(nextStart, -CYCLE.OVULATION_BEFORE_NEXT);
  const fertileStart    = addDays(ovulation, -CYCLE.FERTILE_DAYS_BEFORE);
  const fertileEnd      = addDays(ovulation,  CYCLE.FERTILE_DAYS_AFTER);

  const fmt = (d: Date) => format(d, 'yyyy-MM-dd');

  return {
    nextPeriodStart:     fmt(nextStart),
    nextPeriodEnd:       fmt(nextEnd),
    ovulationDate:       fmt(ovulation),
    fertileWindowStart:  fmt(fertileStart),
    fertileWindowEnd:    fmt(fertileEnd),
    averageCycleLength:  avgCycleLength,
    averagePeriodLength: avgPeriodLength,
    confidence,
  };
}

// ─────────────────────────────────────────────────────────────
//  STATE SHAPE
// ─────────────────────────────────────────────────────────────

interface CycleState {
  entries:    CycleEntry[];
  symptoms:   SymptomEntry[];
  prediction: CyclePrediction | null;

  actions: {
    addEntry:         (entry: CycleEntry) => void;
    updateEntry:      (id: string, patch: Partial<CycleEntry>) => void;
    deleteEntry:      (id: string) => void;

    addSymptom:       (entry: SymptomEntry) => void;
    updateSymptom:    (id: string, patch: Partial<SymptomEntry>) => void;
    deleteSymptom:    (id: string) => void;

    getSymptomByDate: (date: string) => SymptomEntry | undefined;
    getEntryForDate:  (date: string) => CycleEntry | undefined;

    seed:             (entries: CycleEntry[], symptoms: SymptomEntry[]) => void;
    reset:            () => void;
  };
}

// ─────────────────────────────────────────────────────────────
//  STORE
// ─────────────────────────────────────────────────────────────

export const useCycleStore = create<CycleState>()(
  persist(
    immer((set, get) => ({
      entries:    [],
      symptoms:   [],
      prediction: null,

      actions: {
        addEntry: (entry) =>
          set((state) => {
            state.entries.push(entry);
            state.prediction = computePrediction(state.entries);
          }),

        updateEntry: (id, patch) =>
          set((state) => {
            const idx = state.entries.findIndex(e => e.id === id);
            if (idx !== -1) {
              Object.assign(state.entries[idx]!, patch);
              state.prediction = computePrediction(state.entries);
            }
          }),

        deleteEntry: (id) =>
          set((state) => {
            state.entries = state.entries.filter(e => e.id !== id);
            state.prediction = computePrediction(state.entries);
          }),

        addSymptom: (entry) =>
          set((state) => {
            // Replace existing entry for same date
            const idx = state.symptoms.findIndex(s => s.date === entry.date);
            if (idx !== -1) {
              state.symptoms[idx] = entry;
            } else {
              state.symptoms.push(entry);
            }
          }),

        updateSymptom: (id, patch) =>
          set((state) => {
            const idx = state.symptoms.findIndex(s => s.id === id);
            if (idx !== -1) Object.assign(state.symptoms[idx]!, patch);
          }),

        deleteSymptom: (id) =>
          set((state) => {
            state.symptoms = state.symptoms.filter(s => s.id !== id);
          }),

        getSymptomByDate: (date) =>
          get().symptoms.find(s => s.date === date),

        getEntryForDate: (date) =>
          get().entries.find(e => {
            const start = e.startDate;
            const end   = e.endDate ?? e.startDate;
            return date >= start && date <= end;
          }),

        seed: (entries, symptoms) =>
          set((state) => {
            state.entries    = entries;
            state.symptoms   = symptoms;
            state.prediction = computePrediction(entries);
          }),

        reset: () =>
          set((state) => {
            state.entries    = [];
            state.symptoms   = [];
            state.prediction = null;
          }),
      },
    })),
    {
      name:    STORAGE_KEYS.STORE_CYCLE,
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) => ({
        entries:    state.entries,
        symptoms:   state.symptoms,
        prediction: state.prediction,
      }),
    }
  )
);

// ─────────────────────────────────────────────────────────────
//  SELECTORS
// ─────────────────────────────────────────────────────────────

export const selectCycleEntries    = (s: CycleState) => s.entries;
export const selectSymptoms        = (s: CycleState) => s.symptoms;
export const selectPrediction      = (s: CycleState) => s.prediction;
export const selectCycleActions    = (s: CycleState) => s.actions;
export const selectSortedEntries   = (s: CycleState) =>
  [...s.entries].sort((a, b) => b.startDate.localeCompare(a.startDate));
