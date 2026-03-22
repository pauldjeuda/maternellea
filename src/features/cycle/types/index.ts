/**
 * features/cycle/types/index.ts
 *
 * Cycle-feature-specific types and Zod validation schemas.
 * Domain models (CycleEntry, SymptomEntry…) live in @types/models.
 * These types are local to the cycle feature only.
 */

import { z } from 'zod';
import type { CycleEntry, SymptomEntry, CyclePrediction, FlowIntensity, SymptomType, MoodLevel, FatigueLevel, PainLevel } from '@types/models';

// ─────────────────────────────────────────────────────────────
//  DAILY NOTE
// ─────────────────────────────────────────────────────────────

export interface DailyNote {
  id:         string;
  date:       string;   // ISODate
  text:       string;
  createdAt:  string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────
//  CYCLE STATISTICS  (derived, never stored)
// ─────────────────────────────────────────────────────────────

export interface CycleStats {
  totalCycles:          number;
  averageCycleLength:   number;
  minCycleLength:       number;
  maxCycleLength:       number;
  averagePeriodLength:  number;
  regularityScore:      number;  // 0–100 (stddev-based)
  mostCommonSymptoms:   { symptom: string; count: number }[];
  averageMood:          number;
  averagePain:          number;
}

// ─────────────────────────────────────────────────────────────
//  CALENDAR DAY  (what each calendar cell shows)
// ─────────────────────────────────────────────────────────────

export type CalendarDayType =
  | 'period'        // confirmed bleeding day
  | 'period_end'    // last day of period
  | 'fertile'       // within fertile window
  | 'ovulation'     // estimated ovulation day
  | 'predicted_period'   // predicted future period
  | 'predicted_fertile'  // predicted fertile window
  | 'today'
  | 'normal';

export interface CalendarDay {
  date:       string;   // ISODate
  types:      CalendarDayType[];
  hasSymptom: boolean;
  hasNote:    boolean;
  isToday:    boolean;
  isPast:     boolean;
  cycleDay?:  number;   // day number within current cycle (1-based)
}

// ─────────────────────────────────────────────────────────────
//  ZOD SCHEMAS
// ─────────────────────────────────────────────────────────────

const isoDate = z
  .string({ required_error: 'La date est requise' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (AAAA-MM-JJ)');

// Add Period / Edit Period
export const addPeriodSchema = z
  .object({
    startDate: isoDate,
    endDate:   isoDate.optional(),
    flow:      z.enum(['spotting', 'light', 'medium', 'heavy']).optional(),
    notes:     z.string().max(500, 'Note trop longue').optional(),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true;
      return data.endDate >= data.startDate;
    },
    { message: 'La date de fin doit être après la date de début', path: ['endDate'] },
  )
  .refine(
    (data) => {
      if (!data.endDate) return true;
      const start = new Date(data.startDate);
      const end   = new Date(data.endDate);
      const diff  = (end.getTime() - start.getTime()) / 86_400_000;
      return diff <= 14;
    },
    { message: 'La durée des règles ne peut pas dépasser 14 jours', path: ['endDate'] },
  );

export type AddPeriodFormValues = z.infer<typeof addPeriodSchema>;

// Add Symptoms / Edit Symptoms
export const addSymptomsSchema = z.object({
  date:     isoDate,
  symptoms: z.array(z.string()).default([]),
  mood:     z.number().min(1).max(5).default(3),
  fatigue:  z.number().min(1).max(5).default(3),
  pain:     z.number().min(0).max(5).default(0),
  flow:     z.enum(['spotting', 'light', 'medium', 'heavy']).optional(),
  notes:    z.string().max(500, 'Note trop longue').optional(),
});

export type AddSymptomsFormValues = z.infer<typeof addSymptomsSchema>;

// Daily Note
export const dailyNoteSchema = z.object({
  date: isoDate,
  text: z
    .string({ required_error: 'La note ne peut pas être vide' })
    .min(1, 'Écrivez quelque chose')
    .max(1000, 'Note trop longue (1000 caractères max)'),
});

export type DailyNoteFormValues = z.infer<typeof dailyNoteSchema>;

// ─────────────────────────────────────────────────────────────
//  CYCLE PHASE (today's position)
// ─────────────────────────────────────────────────────────────

export type CyclePhaseToday =
  | 'menstrual'    // currently bleeding
  | 'follicular'   // post-period, pre-fertile
  | 'fertile'      // within fertile window
  | 'ovulation'    // ovulation day
  | 'luteal'       // post-ovulation, pre-period
  | 'unknown';

export interface TodayCycleStatus {
  phase:         CyclePhaseToday;
  cycleDay:      number | null;  // day 1 = first day of period
  daysUntilNext: number | null;
  label:         string;
  emoji:         string;
  accent:        string;         // color token
}
