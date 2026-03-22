/**
 * features/pregnancy/types/index.ts
 *
 * All pregnancy-feature-specific types and Zod schemas.
 * Domain models live in @types/models — these are form/UI types only.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
//  CHECKLIST
// ─────────────────────────────────────────────────────────────

export interface ChecklistItem {
  id:         string;
  label:      string;
  category:   ChecklistCategory;
  weekFrom:   number;   // recommended week to start
  weekTo:     number;   // deadline week
  isDone:     boolean;
  completedAt?: string;
  isRequired:  boolean;
}

export type ChecklistCategory =
  | 'medical'
  | 'admin'
  | 'preparation'
  | 'wellbeing'
  | 'baby_gear';

// ─────────────────────────────────────────────────────────────
//  ZOD SCHEMAS
// ─────────────────────────────────────────────────────────────

const isoDate = z
  .string({ required_error: 'La date est requise' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : AAAA-MM-JJ');

// ── Appointment form ────────────────────────────────────────

export const appointmentSchema = z.object({
  title: z
    .string({ required_error: 'Le titre est requis' })
    .min(2, 'Titre trop court')
    .max(80, 'Titre trop long'),
  date: isoDate,
  time: z
    .string({ required_error: "L'heure est requise" })
    .regex(/^\d{2}:\d{2}$/, 'Format attendu : HH:MM'),
  location:       z.string().max(100).optional(),
  doctorName:     z.string().max(80).optional(),
  speciality:     z.string().max(60).optional(),
  notes:          z.string().max(500).optional(),
  reminderEnabled: z.boolean().default(true),
  reminderMinutes: z.number().min(0).max(10080).optional(), // up to 1 week
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;

// ── Medical exam form ───────────────────────────────────────

export const examSchema = z.object({
  type: z
    .string({ required_error: "Le type d'examen est requis" })
    .min(2, 'Précisez le type')
    .max(80),
  scheduledDate: isoDate,
  labName:      z.string().max(80).optional(),
  doctorName:   z.string().max(80).optional(),
  result:       z.string().max(500).optional(),
  notes:        z.string().max(500).optional(),
  isCompleted:  z.boolean().default(false),
  completedDate: isoDate.optional(),
}).refine(
  (data) => !data.isCompleted || !!data.completedDate,
  { message: 'Date de réalisation requise si examen effectué', path: ['completedDate'] },
);

export type ExamFormValues = z.infer<typeof examSchema>;

// ── Journal entry form ──────────────────────────────────────

export const journalEntrySchema = z.object({
  date:    isoDate,
  content: z
    .string({ required_error: 'Écrivez quelque chose' })
    .min(1, 'Écrivez quelque chose')
    .max(3000, '3000 caractères maximum'),
  mood: z.number().min(1).max(5).default(4),
  tags: z.array(z.string()).max(5).default([]),
});

export type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;

// ── Weight entry form ───────────────────────────────────────

export const weightEntrySchema = z.object({
  date: isoDate,
  weightKg: z
    .number({ required_error: 'Le poids est requis', invalid_type_error: 'Entrez un nombre valide' })
    .min(30, 'Poids trop faible')
    .max(250, 'Poids trop élevé'),
  notes: z.string().max(200).optional(),
});

export type WeightEntryFormValues = z.infer<typeof weightEntrySchema>;

// ─────────────────────────────────────────────────────────────
//  UI / DERIVED TYPES
// ─────────────────────────────────────────────────────────────

export interface PregnancyProgress {
  week:         number;
  day:          number;
  trimester:    1 | 2 | 3;
  pct:          number;         // 0–100
  daysLeft:     number;
  weeksLeft:    number;
  dueDate:      string;
  isTerminated: boolean;        // past 40 weeks
  trimesterLabel: string;
  trimesterColor: string;
}

export interface WeightGain {
  current:      number;         // kg from start
  startWeight?: number;
  entries:      { date: string; kg: number }[];
  trend:        'gaining' | 'stable' | 'losing';
}

// Exam type suggestions (for picker)
export const EXAM_TYPE_SUGGESTIONS = [
  'Échographie T1 (11–13 SA)',
  'Échographie morphologique T2 (20–24 SA)',
  'Échographie T3 (30–34 SA)',
  'Prise de sang — NFS',
  'Prise de sang — sérologie',
  'Amniocentèse',
  'Test de dépistage',
  'Streptocoque B',
  'Rythme cardiaque fœtal',
  'Consultation chez le généraliste',
  'Consultation sage-femme',
  'Cours de préparation',
  'Anesthésiste (consultation péri-op)',
] as const;

// Journal tags
export const JOURNAL_TAGS = [
  'Mouvements bébé 👋',
  'Rendez-vous 📋',
  'Symptôme 💊',
  'Émotion 💭',
  'Famille 👨‍👩‍👧',
  'Achats 🛍️',
  'Prépas 🏥',
  'Rêve 🌙',
] as const;

// Reminder options
export const REMINDER_OPTIONS = [
  { label: '15 minutes avant',  value: 15  },
  { label: '30 minutes avant',  value: 30  },
  { label: '1 heure avant',     value: 60  },
  { label: '2 heures avant',    value: 120 },
  { label: '1 jour avant',      value: 1440 },
  { label: '2 jours avant',     value: 2880 },
] as const;
