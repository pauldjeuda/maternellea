/**
 * features/calendar/utils/calendarMappers.ts
 *
 * Pure functions: domain model → CalendarEvent[].
 * No side effects, no React, fully testable.
 *
 * Each mapper is isolated:
 *   mapCycleEntries()    — periods (confirmed + predicted)
 *   mapPrediction()      — ovulation + fertile window
 *   mapAppointments()    — prenatal / postnatal appointments
 *   mapExams()           — medical exams
 *   mapVaccineRecords()  — vaccine administrations + upcoming
 *
 * To add a new source: add one new mapper here + call it in
 * useCalendarData. Zero changes to screens.
 */

import {
  parseISO, eachDayOfInterval, format, addDays,
} from 'date-fns';
import type {
  CycleEntry, CyclePrediction,
  Appointment, MedicalExam, VaccineRecord,
} from '@types/models';
import { tokens } from '@theme/tokens';
import type { CalendarEvent } from '../types';

const { colors, palette } = tokens;

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

function isoFromDate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function timeFromISO(datetime?: string): string | undefined {
  if (!datetime) return undefined;
  const match = datetime.match(/T(\d{2}:\d{2})/);
  return match?.[1];
}

/** Expand a date range into all ISO days between start and end (inclusive) */
function expandRange(start: string, end: string): string[] {
  try {
    const days = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) });
    return days.map(isoFromDate);
  } catch {
    return [start];
  }
}

// ─────────────────────────────────────────────────────────────
//  1. CYCLE ENTRIES  (confirmed periods)
// ─────────────────────────────────────────────────────────────

export function mapCycleEntries(entries: CycleEntry[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const entry of entries) {
    const end  = entry.endDate ?? entry.startDate;
    const days = expandRange(entry.startDate, end);

    days.forEach((date, idx) => {
      const isFirst = idx === 0;
      const isLast  = idx === days.length - 1;

      events.push({
        id:         `period-${entry.id}-${date}`,
        date,
        endDate:    isFirst ? end : undefined,
        type:       'period',
        title:      isFirst ? 'Début des règles' : isLast ? 'Fin des règles' : 'Règles',
        subtitle:   entry.flow ? `Flux ${entry.flow === 'light' ? 'léger' : entry.flow === 'medium' ? 'moyen' : entry.flow === 'heavy' ? 'abondant' : 'spotting'}` : undefined,
        color:      colors.phaseCycle,
        bgColor:    colors.primaryLight,
        emoji:      '🩸',
        isPrimary:  isFirst,
        entityType: 'period',
        entityId:   entry.id,
        isDone:     true,
        sortOrder:  0,
      });
    });
  }

  return events;
}

// ─────────────────────────────────────────────────────────────
//  2. CYCLE PREDICTION  (future period + fertile window)
// ─────────────────────────────────────────────────────────────

export function mapCyclePrediction(prediction: CyclePrediction | null): CalendarEvent[] {
  if (!prediction) return [];
  const events: CalendarEvent[] = [];

  // Predicted period
  const periodDays = expandRange(prediction.nextPeriodStart, prediction.nextPeriodEnd);
  periodDays.forEach((date, idx) => {
    events.push({
      id:         `pred-period-${date}`,
      date,
      type:       'period_predicted',
      title:      idx === 0 ? 'Règles estimées' : 'Règles estimées',
      color:      colors.phaseCycle,
      bgColor:    palette.rose100,
      emoji:      '🩸',
      isPrimary:  idx === 0,
      entityType: 'prediction',
      entityId:   'cycle-prediction',
      sortOrder:  1,
    });
  });

  // Fertile window (excluding ovulation day)
  const fertileDays = expandRange(prediction.fertileWindowStart, prediction.fertileWindowEnd);
  fertileDays.forEach(date => {
    const isOvulation = date === prediction.ovulationDate;
    events.push({
      id:         `fertile-${date}`,
      date,
      type:       isOvulation ? 'ovulation' : 'fertile',
      title:      isOvulation ? 'Ovulation estimée' : 'Fenêtre fertile',
      color:      colors.fertile,
      bgColor:    colors.fertileLight,
      emoji:      isOvulation ? '🌟' : '🌿',
      isPrimary:  isOvulation,
      entityType: 'prediction',
      entityId:   'cycle-prediction',
      sortOrder:  isOvulation ? 0 : 2,
    });
  });

  return events;
}

// ─────────────────────────────────────────────────────────────
//  3. APPOINTMENTS
// ─────────────────────────────────────────────────────────────

export function mapAppointments(appointments: Appointment[]): CalendarEvent[] {
  return appointments.map(apt => {
    const dateOnly = apt.date.split('T')[0]!;
    return {
      id:         `apt-${apt.id}`,
      date:       dateOnly,
      type:       'appointment' as const,
      title:      apt.title,
      subtitle:   [apt.doctorName, apt.location].filter(Boolean).join(' · '),
      color:      colors.phasePregnancy,
      bgColor:    colors.secondaryLight,
      emoji:      '📋',
      isPrimary:  true,
      entityType: 'appointment' as const,
      entityId:   apt.id,
      time:       timeFromISO(apt.date),
      isDone:     apt.isCompleted,
      sortOrder:  3,
    };
  });
}

// ─────────────────────────────────────────────────────────────
//  4. MEDICAL EXAMS
// ─────────────────────────────────────────────────────────────

export function mapExams(exams: MedicalExam[]): CalendarEvent[] {
  return exams.map(exam => ({
    id:         `exam-${exam.id}`,
    date:       exam.completedDate ?? exam.scheduledDate,
    type:       'exam' as const,
    title:      exam.type,
    subtitle:   exam.labName ?? exam.doctorName,
    color:      colors.info,
    bgColor:    colors.infoLight,
    emoji:      '🔬',
    isPrimary:  true,
    entityType: 'exam' as const,
    entityId:   exam.id,
    isDone:     exam.isCompleted,
    sortOrder:  4,
  }));
}

// ─────────────────────────────────────────────────────────────
//  5. VACCINE RECORDS
// ─────────────────────────────────────────────────────────────

export function mapVaccineRecords(records: VaccineRecord[]): CalendarEvent[] {
  return records
    .filter(r => r.administeredDate ?? r.scheduledDate)
    .map(record => {
      const isDone = record.status === 'done';
      const date   = record.administeredDate ?? record.scheduledDate!;
      return {
        id:         `vacc-${record.id}`,
        date,
        type:       'vaccine' as const,
        title:      record.vaccine.shortName,
        subtitle:   isDone ? 'Effectué' : record.vaccine.recommendedAgeLabel,
        color:      isDone ? colors.success : colors.warning,
        bgColor:    isDone ? colors.successLight : colors.warningLight,
        emoji:      '💉',
        isPrimary:  true,
        entityType: 'vaccine' as const,
        entityId:   record.id,
        isDone,
        sortOrder:  5,
      };
    });
}

// ─────────────────────────────────────────────────────────────
//  AGGREGATE  (merge all sources → DayEvents map)
// ─────────────────────────────────────────────────────────────

export function buildDayMap(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    if (!map.has(ev.date)) map.set(ev.date, []);
    map.get(ev.date)!.push(ev);
  }
  // Sort events within each day
  for (const [date, dayEvents] of map) {
    dayEvents.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return map;
}
