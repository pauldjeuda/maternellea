/**
 * features/cycle/utils/cycleCalc.ts
 *
 * Pure calculation functions for the cycle module.
 * No side effects, no imports from stores or React.
 * Fully testable in isolation.
 */

import {
  parseISO, format, addDays, differenceInDays,
  isSameDay, isWithinInterval, startOfMonth, endOfMonth,
  eachDayOfInterval, isToday, isBefore, isAfter,
} from 'date-fns';
import type { CycleEntry, SymptomEntry, CyclePrediction } from '@types/models';
import type { CalendarDay, CalendarDayType, CycleStats, TodayCycleStatus } from '../types';
import { tokens } from '@theme/tokens';

const { colors } = tokens;

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

export function toISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function parseSafe(date: string): Date {
  return parseISO(date);
}

// ─────────────────────────────────────────────────────────────
//  CYCLE STATISTICS
// ─────────────────────────────────────────────────────────────

export function computeCycleStats(
  entries: CycleEntry[],
  symptoms: SymptomEntry[],
): CycleStats {
  const sorted = [...entries].sort(
    (a, b) => parseSafe(b.startDate).getTime() - parseSafe(a.startDate).getTime(),
  );

  if (sorted.length === 0) {
    return {
      totalCycles:         0,
      averageCycleLength:  28,
      minCycleLength:      0,
      maxCycleLength:      0,
      averagePeriodLength: 5,
      regularityScore:     0,
      mostCommonSymptoms:  [],
      averageMood:         3,
      averagePain:         0,
    };
  }

  // Cycle lengths from gaps between period starts
  const gaps: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = differenceInDays(
      parseSafe(sorted[i]!.startDate),
      parseSafe(sorted[i + 1]!.startDate),
    );
    if (gap >= 15 && gap <= 60) gaps.push(gap);
  }

  const avgCycle = gaps.length > 0
    ? Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length)
    : 28;

  const minCycle = gaps.length > 0 ? Math.min(...gaps) : 0;
  const maxCycle = gaps.length > 0 ? Math.max(...gaps) : 0;

  // Period durations
  const durations = sorted
    .filter(e => e.endDate)
    .map(e => differenceInDays(parseSafe(e.endDate!), parseSafe(e.startDate)) + 1);
  const avgPeriod = durations.length > 0
    ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
    : 5;

  // Regularity score: 100 = perfectly regular, lower = more variable
  let regularityScore = 100;
  if (gaps.length >= 2) {
    const mean = gaps.reduce((s, g) => s + g, 0) / gaps.length;
    const variance = gaps.reduce((s, g) => s + Math.pow(g - mean, 2), 0) / gaps.length;
    const stddev = Math.sqrt(variance);
    // stddev of 0 = 100, stddev of 7 = 0
    regularityScore = Math.max(0, Math.round(100 - (stddev / 7) * 100));
  }

  // Symptom frequency
  const freq: Record<string, number> = {};
  symptoms.forEach(s => s.symptoms.forEach(sym => {
    freq[sym] = (freq[sym] ?? 0) + 1;
  }));
  const mostCommonSymptoms = Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([symptom, count]) => ({ symptom, count }));

  // Avg mood and pain
  const moodEntries  = symptoms.filter(s => s.mood  !== undefined);
  const painEntries  = symptoms.filter(s => s.pain  !== undefined);
  const averageMood  = moodEntries.length > 0
    ? Math.round(moodEntries.reduce((s, e) => s + e.mood, 0) / moodEntries.length * 10) / 10
    : 3;
  const averagePain  = painEntries.length > 0
    ? Math.round(painEntries.reduce((s, e) => s + e.pain, 0) / painEntries.length * 10) / 10
    : 0;

  return {
    totalCycles:        entries.length,
    averageCycleLength: avgCycle,
    minCycleLength:     minCycle,
    maxCycleLength:     maxCycle,
    averagePeriodLength: avgPeriod,
    regularityScore,
    mostCommonSymptoms,
    averageMood,
    averagePain,
  };
}

// ─────────────────────────────────────────────────────────────
//  TODAY'S CYCLE PHASE
// ─────────────────────────────────────────────────────────────

export function getTodayCycleStatus(
  entries: CycleEntry[],
  prediction: CyclePrediction | null,
): TodayCycleStatus {
  const today     = new Date();
  const todayISO  = toISO(today);

  // Check if currently in period
  const activePeriod = entries.find(e => {
    const start = e.startDate;
    const end   = e.endDate ?? e.startDate;
    return todayISO >= start && todayISO <= end;
  });

  if (activePeriod) {
    const cycleDay = differenceInDays(today, parseSafe(activePeriod.startDate)) + 1;
    return {
      phase:         'menstrual',
      cycleDay,
      daysUntilNext: null,
      label:         `Règles — jour ${cycleDay}`,
      emoji:         '🩸',
      accent:        colors.phaseCycle,
    };
  }

  if (!prediction) {
    return {
      phase:         'unknown',
      cycleDay:      null,
      daysUntilNext: null,
      label:         'Ajoutez vos règles pour commencer le suivi',
      emoji:         '🌙',
      accent:        colors.phaseCycle,
    };
  }

  const daysUntilNext = Math.max(
    0,
    differenceInDays(parseSafe(prediction.nextPeriodStart), today),
  );

  // Ovulation day
  if (todayISO === prediction.ovulationDate) {
    return {
      phase:         'ovulation',
      cycleDay:      null,
      daysUntilNext,
      label:         "Jour d'ovulation estimé",
      emoji:         '🌿',
      accent:        colors.fertile,
    };
  }

  // Fertile window
  if (
    todayISO >= prediction.fertileWindowStart &&
    todayISO <= prediction.fertileWindowEnd
  ) {
    const dayInWindow = differenceInDays(today, parseSafe(prediction.fertileWindowStart)) + 1;
    return {
      phase:         'fertile',
      cycleDay:      null,
      daysUntilNext,
      label:         `Fenêtre fertile — jour ${dayInWindow}`,
      emoji:         '🌿',
      accent:        colors.fertile,
    };
  }

  // Upcoming period (within 3 days)
  if (daysUntilNext <= 3) {
    return {
      phase:         'luteal',
      cycleDay:      null,
      daysUntilNext,
      label:         daysUntilNext === 0 ? 'Règles attendues aujourd\'hui'
                   : daysUntilNext === 1 ? 'Règles attendues demain'
                   : `Règles dans ${daysUntilNext} jours`,
      emoji:         '🌑',
      accent:        colors.phaseCycle,
    };
  }

  // Post-fertile (luteal)
  if (todayISO > prediction.fertileWindowEnd) {
    return {
      phase:         'luteal',
      cycleDay:      null,
      daysUntilNext,
      label:         `Phase lutéale — J −${daysUntilNext}`,
      emoji:         '🌙',
      accent:        colors.secondary,
    };
  }

  // Follicular (between period end and fertile window)
  return {
    phase:         'follicular',
    cycleDay:      null,
    daysUntilNext,
    label:         `Phase folliculaire — ${daysUntilNext} j avant les règles`,
    emoji:         '☀️',
    accent:        colors.accent,
  };
}

// ─────────────────────────────────────────────────────────────
//  CALENDAR BUILDER
//  Produces a flat array of CalendarDay for any year+month.
// ─────────────────────────────────────────────────────────────

export function buildCalendarMonth(
  year: number,
  month: number,   // 0-based (JS convention)
  entries:    CycleEntry[],
  symptoms:   SymptomEntry[],
  notes:      { date: string }[],
  prediction: CyclePrediction | null,
): CalendarDay[] {
  const start = startOfMonth(new Date(year, month));
  const end   = endOfMonth(start);
  const days  = eachDayOfInterval({ start, end });

  // Build period date sets
  const periodDates = new Set<string>();
  entries.forEach(e => {
    const s = parseSafe(e.startDate);
    const en = e.endDate ? parseSafe(e.endDate) : s;
    eachDayOfInterval({ start: s, end: en }).forEach(d => periodDates.add(toISO(d)));
  });

  const symptomDates = new Set(symptoms.map(s => s.date));
  const noteDates    = new Set(notes.map(n => n.date));

  return days.map(day => {
    const iso    = toISO(day);
    const types: CalendarDayType[] = [];
    const past   = isBefore(day, new Date()) && !isToday(day);

    if (periodDates.has(iso)) {
      types.push('period');
    }

    if (prediction) {
      // Predicted future period
      if (
        iso >= prediction.nextPeriodStart &&
        iso <= prediction.nextPeriodEnd &&
        !periodDates.has(iso)
      ) {
        types.push('predicted_period');
      }

      // Predicted fertile window
      if (
        iso >= prediction.fertileWindowStart &&
        iso <= prediction.fertileWindowEnd &&
        !periodDates.has(iso)
      ) {
        types.push(iso === prediction.ovulationDate ? 'ovulation' : 'predicted_fertile');
      }

      // Confirmed ovulation day if in past
      if (iso === prediction.ovulationDate && past) {
        types.push('ovulation');
      }
    }

    if (isToday(day)) types.push('today');

    return {
      date:       iso,
      types,
      hasSymptom: symptomDates.has(iso),
      hasNote:    noteDates.has(iso),
      isToday:    isToday(day),
      isPast:     past,
    };
  });
}

// ─────────────────────────────────────────────────────────────
//  CALENDAR WEEK GRID  (adds leading padding for Mon-start grid)
// ─────────────────────────────────────────────────────────────

export function buildCalendarGrid(days: CalendarDay[]): (CalendarDay | null)[] {
  if (days.length === 0) return [];
  const firstDay = parseSafe(days[0]!.date);
  // getDay(): 0=Sun … 6=Sat. For Mon-start: padding = (getDay() + 6) % 7
  const padding  = (firstDay.getDay() + 6) % 7;
  const nulls: null[] = Array(padding).fill(null);
  return [...nulls, ...days];
}

// ─────────────────────────────────────────────────────────────
//  GENERATE ID
// ─────────────────────────────────────────────────────────────

export function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
