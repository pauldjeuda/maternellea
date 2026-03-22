/**
 * features/vaccines/types/index.ts
 *
 * Vaccine module type system.
 *
 * Architecture for replaceability:
 * ─────────────────────────────────────────────────────────────
 * VaccineDefinition  — the "what": comes from a country-specific
 *                      schedule provider (FR, CM, BE, etc.).
 *                      Immutable reference data.
 *
 * VaccineRecord      — the "when": the user's actual administration
 *                      data tied to a specific baby.
 *                      Lives in babyStore.
 *
 * VaccineScheduleProvider — interface every country calendar must
 *                      implement. Swap the country by changing the
 *                      active provider in vaccineScheduleService.ts
 *
 * VaccineStatusResult — computed status for a single definition
 *                      given a baby's birth date.
 * ─────────────────────────────────────────────────────────────
 */

import { z } from 'zod';
import type { VaccineRecord, VaccineStatus } from '@types/models';

// ─────────────────────────────────────────────────────────────
//  VACCINE DEFINITION  (reference / schedule data)
// ─────────────────────────────────────────────────────────────

/** A single dose entry in a national schedule */
export interface VaccineDefinition {
  /** Unique within a schedule, e.g. "hexa-1" */
  id:                   string;
  /** Human name, e.g. "Hexavalent — dose 1" */
  name:                 string;
  /** Short label for compact display, e.g. "Hexa 1" */
  shortName:            string;
  /** Plain-text description of what the vaccine protects against */
  description:          string;
  /** Diseases covered */
  diseases:             readonly string[];
  /** Recommended age in months (used to compute scheduledDate) */
  recommendedAgeMonths: number;
  /** Human-readable age, e.g. "2 mois" */
  recommendedAgeLabel:  string;
  /** Total doses in the series */
  numberOfDoses:        number;
  /** 1-based dose number within the series */
  doseNumber:           number;
  /** Grouped series name, e.g. "Hexavalent" */
  seriesName:           string;
  /** Whether legally required in the country */
  isMandatory:          boolean;
  /** If true: offered but not mandatory */
  isRecommended:        boolean;
  /** If false: optional/special indications only */
  isOptional:           boolean;
  /** Window: earliest age ok (months) */
  minAgeMonths:         number;
  /** Window: latest recommended age (months) */
  maxAgeMonths:         number;
  /** Catch-up: can this be given after the window? */
  allowsCatchUp:        boolean;
  /** Additional clinical notes */
  notes?:               string;
}

// ─────────────────────────────────────────────────────────────
//  COUNTRY-SPECIFIC SCHEDULE PROVIDER INTERFACE
//  Any country module must implement this to plug in.
// ─────────────────────────────────────────────────────────────

export interface VaccineScheduleProvider {
  /** ISO 3166-1 alpha-2, e.g. "FR" */
  countryCode:  string;
  /** Display name, e.g. "France" */
  countryName:  string;
  /** Year this schedule was last updated */
  scheduleYear: number;
  /** Source URL for official reference */
  sourceUrl:    string;
  /** Full list of vaccine definitions for this country */
  definitions:  VaccineDefinition[];
}

// ─────────────────────────────────────────────────────────────
//  COMPUTED STATUS PER DEFINITION
// ─────────────────────────────────────────────────────────────

export interface VaccineStatusResult {
  definition:    VaccineDefinition;
  record?:       VaccineRecord;        // undefined if not yet recorded
  status:        VaccineStatus;
  scheduledDate: string;               // ISO date — computed from birthDate + ageMonths
  daysFromNow:   number;               // negative = overdue, positive = upcoming
  isOverdue:     boolean;
  isDueSoon:     boolean;              // within 14 days
  isDone:        boolean;
  label:         string;               // human status label
  urgency:       'done' | 'upcoming' | 'soon' | 'overdue'; // for sort order
}

// ─────────────────────────────────────────────────────────────
//  VACCINE RECORD FORM  (Zod)
// ─────────────────────────────────────────────────────────────

export const recordVaccineSchema = z.object({
  administeredDate: z
    .string({ required_error: 'La date est requise' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : AAAA-MM-JJ')
    .refine(val => {
      const d   = new Date(val);
      const now = new Date();
      return !isNaN(d.getTime()) && d <= now;
    }, 'La date ne peut pas être dans le futur'),
  administeredBy: z.string().max(80).optional(),
  location:       z.string().max(100).optional(),
  batchNumber:    z.string().max(50).optional(),
  sideEffects:    z.string().max(500).optional(),
  notes:          z.string().max(500).optional(),
});

export type RecordVaccineFormValues = z.infer<typeof recordVaccineSchema>;

// ─────────────────────────────────────────────────────────────
//  DISPLAY CONSTANTS
// ─────────────────────────────────────────────────────────────

export const VACCINE_STATUS_CONFIG: Record<VaccineStatus, {
  label:   string;
  emoji:   string;
  color:   string;
  bgColor: string;
  urgency: number;   // sort priority: lower = more urgent
}> = {
  overdue:  { label: 'En retard',  emoji: '⚠️', color: '#B91C1C', bgColor: '#FEE2E2', urgency: 0 },
  due_soon: { label: 'Bientôt',    emoji: '🔔', color: '#92400E', bgColor: '#FEF3C7', urgency: 1 },
  upcoming: { label: 'À venir',    emoji: '📅', color: '#374151', bgColor: '#F3F4F6', urgency: 2 },
  done:     { label: 'Effectué',   emoji: '✅', color: '#166534', bgColor: '#DCFCE7', urgency: 3 },
  skipped:  { label: 'Ignoré',     emoji: '⏭️', color: '#6B7280', bgColor: '#F9FAFB', urgency: 4 },
};

/** Vaccine series grouped display */
export interface VaccineGroup {
  seriesName:   string;
  seriesEmoji:  string;
  definitions:  VaccineStatusResult[];
  allDone:      boolean;
  hasOverdue:   boolean;
  hasDueSoon:   boolean;
}

export const SERIES_EMOJI: Record<string, string> = {
  'BCG':             '🫁',
  'Hexavalent':      '💉',
  'Pneumocoque':     '🫀',
  'Méningocoque B':  '🧠',
  'Méningocoque C':  '🧠',
  'ROR':             '🌡️',
  'Varicelle':       '🔴',
  'DTP':             '💊',
  'Hépatite B':      '🩺',
  'HPV':             '🩻',
  'default':         '💉',
};
