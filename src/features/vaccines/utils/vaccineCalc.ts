/**
 * features/vaccines/utils/vaccineCalc.ts
 *
 * Pure calculation functions — no side effects, no React imports.
 * All business logic for status computation lives here.
 */

import { addMonths, parseISO, differenceInDays, format, isBefore, isAfter } from 'date-fns';
import type { VaccineRecord, VaccineStatus, BabyProfile } from '@types/models';
import type {
  VaccineDefinition, VaccineStatusResult, VaccineGroup,
} from '../types';
import { VACCINE_STATUS_CONFIG, SERIES_EMOJI } from '../types';

// ─────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────

/** Within this many days → status = due_soon */
const DUE_SOON_THRESHOLD_DAYS = 14;

/** More than this many days overdue → flag as concerning */
const OVERDUE_CONCERN_DAYS = 30;

// ─────────────────────────────────────────────────────────────
//  SCHEDULED DATE
// ─────────────────────────────────────────────────────────────

export function computeScheduledDate(birthDate: string, ageMonths: number): string {
  const birth = parseISO(birthDate);
  return format(addMonths(birth, ageMonths), 'yyyy-MM-dd');
}

// ─────────────────────────────────────────────────────────────
//  STATUS COMPUTATION
// ─────────────────────────────────────────────────────────────

export function computeVaccineStatus(
  definition:    VaccineDefinition,
  birthDate:     string,
  record?:       VaccineRecord,
): VaccineStatusResult {
  const today         = new Date();
  const scheduledDate = record?.scheduledDate ?? computeScheduledDate(birthDate, definition.recommendedAgeMonths);
  const scheduledDay  = parseISO(scheduledDate);
  const daysFromNow   = differenceInDays(scheduledDay, today);

  // Already done
  if (record?.status === 'done' || record?.status === 'skipped') {
    return {
      definition,
      record,
      status:        record.status,
      scheduledDate,
      daysFromNow,
      isOverdue:     false,
      isDueSoon:     false,
      isDone:        record.status === 'done',
      label:         VACCINE_STATUS_CONFIG[record.status].label,
      urgency:       record.status === 'done' ? 'done' : 'upcoming',
    };
  }

  // Compute live status
  let status: VaccineStatus;
  let urgency: VaccineStatusResult['urgency'];

  if (daysFromNow < 0) {
    status  = 'overdue';
    urgency = 'overdue';
  } else if (daysFromNow <= DUE_SOON_THRESHOLD_DAYS) {
    status  = 'due_soon';
    urgency = 'soon';
  } else {
    status  = 'upcoming';
    urgency = 'upcoming';
  }

  return {
    definition,
    record,
    status,
    scheduledDate,
    daysFromNow,
    isOverdue:  status === 'overdue',
    isDueSoon:  status === 'due_soon',
    isDone:     false,
    label:      VACCINE_STATUS_CONFIG[status].label,
    urgency,
  };
}

// ─────────────────────────────────────────────────────────────
//  BULK COMPUTATION  (all definitions → status results)
// ─────────────────────────────────────────────────────────────

export function computeAllStatuses(
  definitions: VaccineDefinition[],
  birthDate:   string,
  records:     VaccineRecord[],
): VaccineStatusResult[] {
  return definitions.map(def => {
    const record = records.find(r => r.vaccineId === def.id);
    return computeVaccineStatus(def, birthDate, record);
  });
}

// ─────────────────────────────────────────────────────────────
//  SORT RESULTS
// ─────────────────────────────────────────────────────────────

const URGENCY_ORDER: Record<VaccineStatusResult['urgency'], number> = {
  overdue:  0,
  soon:     1,
  upcoming: 2,
  done:     3,
};

export function sortResults(results: VaccineStatusResult[]): VaccineStatusResult[] {
  return [...results].sort((a, b) => {
    const urgencyDiff = URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
    if (urgencyDiff !== 0) return urgencyDiff;
    // Within same urgency: sort by scheduled date
    return a.scheduledDate.localeCompare(b.scheduledDate);
  });
}

// ─────────────────────────────────────────────────────────────
//  GROUP BY SERIES
// ─────────────────────────────────────────────────────────────

export function groupBySeries(results: VaccineStatusResult[]): VaccineGroup[] {
  const map = new Map<string, VaccineStatusResult[]>();

  for (const r of results) {
    const series = r.definition.seriesName;
    if (!map.has(series)) map.set(series, []);
    map.get(series)!.push(r);
  }

  return Array.from(map.entries()).map(([seriesName, defs]) => ({
    seriesName,
    seriesEmoji: SERIES_EMOJI[seriesName] ?? SERIES_EMOJI['default']!,
    definitions: defs.sort((a, b) => a.definition.doseNumber - b.definition.doseNumber),
    allDone:     defs.every(d => d.isDone),
    hasOverdue:  defs.some(d => d.isOverdue),
    hasDueSoon:  defs.some(d => d.isDueSoon),
  })).sort((a, b) => {
    // Sort groups: overdue first, then soon, done last
    const aScore = a.hasOverdue ? 0 : a.hasDueSoon ? 1 : a.allDone ? 3 : 2;
    const bScore = b.hasOverdue ? 0 : b.hasDueSoon ? 1 : b.allDone ? 3 : 2;
    return aScore - bScore;
  });
}

// ─────────────────────────────────────────────────────────────
//  FILTER HELPERS
// ─────────────────────────────────────────────────────────────

export function filterByStatus(
  results: VaccineStatusResult[],
  statuses: VaccineStatus[],
): VaccineStatusResult[] {
  return results.filter(r => statuses.includes(r.status));
}

export function getUpcoming(results: VaccineStatusResult[]): VaccineStatusResult[] {
  return sortResults(
    results.filter(r => r.status === 'upcoming' || r.status === 'due_soon' || r.status === 'overdue'),
  );
}

export function getDone(results: VaccineStatusResult[]): VaccineStatusResult[] {
  return results
    .filter(r => r.status === 'done')
    .sort((a, b) => (b.record?.administeredDate ?? '').localeCompare(a.record?.administeredDate ?? ''));
}

// ─────────────────────────────────────────────────────────────
//  STATISTICS
// ─────────────────────────────────────────────────────────────

export interface VaccineStats {
  total:     number;
  done:      number;
  overdue:   number;
  dueSoon:   number;
  upcoming:  number;
  pctDone:   number;
  nextDue:   VaccineStatusResult | null;
}

export function computeStats(results: VaccineStatusResult[]): VaccineStats {
  const done     = results.filter(r => r.isDone).length;
  const overdue  = results.filter(r => r.isOverdue).length;
  const dueSoon  = results.filter(r => r.isDueSoon).length;
  const upcoming = results.filter(r => r.status === 'upcoming').length;
  const total    = results.length;
  const pctDone  = total > 0 ? Math.round((done / total) * 100) : 0;

  const pending  = sortResults(results.filter(r => !r.isDone));
  const nextDue  = pending[0] ?? null;

  return { total, done, overdue, dueSoon, upcoming, pctDone, nextDue };
}

// ─────────────────────────────────────────────────────────────
//  ID GENERATOR
// ─────────────────────────────────────────────────────────────

export function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─────────────────────────────────────────────────────────────
//  DAYS LABEL  (human-readable delay)
// ─────────────────────────────────────────────────────────────

export function daysLabel(days: number): string {
  if (days === 0) return "aujourd'hui";
  if (days === 1) return 'demain';
  if (days === -1) return 'hier';
  if (days > 0)   return `dans ${days} jour${days > 1 ? 's' : ''}`;
  return `en retard de ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''}`;
}
