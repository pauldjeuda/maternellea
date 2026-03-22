/**
 * Postpartum + Baby — shared types and Zod validation schemas.
 * All domain models live in @types/models. These are form/UI types only.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
//  HEALTH NOTE  (baby-specific free-text notes)
// ─────────────────────────────────────────────────────────────

export interface HealthNote {
  id:        string;
  babyId:    string;
  date:      string;   // ISODate
  category:  HealthNoteCategory;
  content:   string;
  createdAt: string;
  updatedAt?: string;
}

export type HealthNoteCategory =
  | 'general'
  | 'feeding'
  | 'sleep'
  | 'symptom'
  | 'medication'
  | 'doctor_visit'
  | 'milestone';

export const HEALTH_NOTE_CATEGORIES: Record<HealthNoteCategory, { label: string; emoji: string; color: string }> = {
  general:      { label: 'Général',        emoji: '📝', color: '#9E9E9E' },
  feeding:      { label: 'Alimentation',   emoji: '🍼', color: '#FF7A40' },
  sleep:        { label: 'Sommeil',        emoji: '🌙', color: '#A367A1' },
  symptom:      { label: 'Symptôme',      emoji: '🌡️', color: '#F53D6B' },
  medication:   { label: 'Médicament',     emoji: '💊', color: '#0284C7' },
  doctor_visit: { label: 'Consultation',   emoji: '👩‍⚕️', color: '#3DA468' },
  milestone:    { label: 'Étape clé',      emoji: '⭐', color: '#FBBF24' },
};

// ─────────────────────────────────────────────────────────────
//  POSTPARTUM ENTRY FORM
// ─────────────────────────────────────────────────────────────

export const postpartumEntrySchema = z.object({
  date:           z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide'),
  mood:           z.number().min(1).max(5).default(3),
  fatigue:        z.number().min(1).max(5).default(3),
  pain:           z.number().min(0).max(5).default(0),
  symptoms:       z.array(z.string()).default([]),
  isBreastfeeding: z.boolean().default(false),
  notes:          z.string().max(1000).optional(),
});

export type PostpartumEntryFormValues = z.infer<typeof postpartumEntrySchema>;

// ─────────────────────────────────────────────────────────────
//  BABY PROFILE FORM
// ─────────────────────────────────────────────────────────────

export const babyProfileSchema = z.object({
  name: z
    .string({ required_error: 'Le prénom est requis' })
    .min(1, 'Prénom requis')
    .max(50, 'Trop long')
    .trim(),
  birthDate: z
    .string({ required_error: 'La date de naissance est requise' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : AAAA-MM-JJ')
    .refine(val => {
      const d = new Date(val);
      if (isNaN(d.getTime())) return false;
      const diff = (new Date().getTime() - d.getTime()) / 86_400_000;
      return diff >= 0 && diff <= 1095; // max 3 years
    }, 'Date invalide'),
  birthTime:   z.string().regex(/^\d{2}:\d{2}$/).optional(),
  gender:      z.enum(['female', 'male', 'unknown']).default('unknown'),
  birthWeightGrams: z
    .number().min(400).max(6000).optional()
    .or(z.nan().transform(() => undefined)),
  birthHeightCm: z
    .number().min(30).max(65).optional()
    .or(z.nan().transform(() => undefined)),
  bloodType:        z.string().max(10).optional(),
  pediatricianName: z.string().max(80).optional(),
  maternityName:    z.string().max(80).optional(),
  notes:            z.string().max(500).optional(),
});

export type BabyProfileFormValues = z.infer<typeof babyProfileSchema>;

// ─────────────────────────────────────────────────────────────
//  GROWTH ENTRY FORM
// ─────────────────────────────────────────────────────────────

export const growthEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide'),
  weightGrams: z
    .number({ required_error: 'Le poids est requis', invalid_type_error: 'Nombre attendu' })
    .min(400, 'Poids trop faible')
    .max(30000, 'Poids trop élevé'),
  heightCm: z
    .number({ required_error: 'La taille est requise', invalid_type_error: 'Nombre attendu' })
    .min(30, 'Taille trop faible')
    .max(130, 'Taille trop élevée'),
  headCircumferenceCm: z.number().min(20).max(60).optional()
    .or(z.nan().transform(() => undefined)),
  measuredBy: z.string().max(80).optional(),
  notes:      z.string().max(300).optional(),
});

export type GrowthEntryFormValues = z.infer<typeof growthEntrySchema>;

// ─────────────────────────────────────────────────────────────
//  HEALTH NOTE FORM
// ─────────────────────────────────────────────────────────────

export const healthNoteSchema = z.object({
  date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide'),
  category: z.enum(['general','feeding','sleep','symptom','medication','doctor_visit','milestone']).default('general'),
  content:  z.string().min(1, 'Écrivez quelque chose').max(1000, '1000 caractères max'),
});

export type HealthNoteFormValues = z.infer<typeof healthNoteSchema>;

// ─────────────────────────────────────────────────────────────
//  DERIVED UI TYPES
// ─────────────────────────────────────────────────────────────

export interface GrowthSummary {
  latestWeight: number;   // grams
  latestHeight: number;   // cm
  latestHead?:  number;   // cm
  latestDate:   string;
  gainFromBirth: {
    weightGrams: number;
    heightCm:    number;
  } | null;
  trend: 'gaining' | 'stable' | 'concern'; // simplified
}

// WHO percentile bands (simplified) — for visual reference
export const WHO_WEIGHT_BANDS_GIRL = [
  // [ageMonths, p3, p15, p50, p85, p97] — grams
  [0,   2600, 2900, 3300, 3700, 4000],
  [1,   3300, 3700, 4200, 4700, 5100],
  [2,   4000, 4500, 5100, 5700, 6200],
  [3,   4600, 5100, 5800, 6500, 7000],
  [4,   5100, 5700, 6400, 7200, 7700],
  [5,   5500, 6100, 6900, 7700, 8200],
  [6,   5800, 6500, 7300, 8100, 8700],
  [9,   6700, 7500, 8400, 9300, 9900],
  [12,  7500, 8400, 9500, 10500, 11200],
  [18,  9000, 10000, 11200, 12400, 13200],
  [24,  10100, 11200, 12600, 14000, 14900],
] as const;
