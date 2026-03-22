/**
 * features/onboarding/types/index.ts
 *
 * Zod schemas + TS types for every step of the onboarding wizard.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
//  INITIAL PROFILE SETUP
// ─────────────────────────────────────────────────────────────

export const initialProfileSchema = z.object({
  firstName: z
    .string({ required_error: 'Le prénom est requis' })
    .min(2, 'Au moins 2 caractères')
    .max(50, 'Trop long')
    .trim(),
  dateOfBirth: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // optional
        const date = new Date(val);
        if (isNaN(date.getTime())) return false;
        const now  = new Date();
        const age  = now.getFullYear() - date.getFullYear();
        return age >= 13 && age <= 60;
      },
      { message: 'Date de naissance invalide (13–60 ans)' },
    ),
  country: z
    .string({ required_error: 'Veuillez choisir votre pays' })
    .min(2, 'Pays requis'),
});

export type InitialProfileFormValues = z.infer<typeof initialProfileSchema>;

// ─────────────────────────────────────────────────────────────
//  JOURNEY SELECTION
// ─────────────────────────────────────────────────────────────

export const journeySelectionSchema = z.object({
  phase: z.enum(['cycle', 'pregnancy', 'postpartum'], {
    required_error: 'Veuillez choisir votre parcours',
  }),
});

export type JourneySelectionFormValues = z.infer<typeof journeySelectionSchema>;

// ─────────────────────────────────────────────────────────────
//  PREGNANCY SETUP
// ─────────────────────────────────────────────────────────────

// ISO date regex YYYY-MM-DD
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const pregnancySetupSchema = z
  .object({
    // Method of entry — either they give LMP or they give week
    entryMethod: z.enum(['lmp', 'week']),

    // LMP branch
    lmpDate: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          if (!isoDateRegex.test(val)) return false;
          const d = new Date(val);
          if (isNaN(d.getTime())) return false;
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
          return diffDays >= 0 && diffDays <= 280; // can't be in the future or > 40 weeks ago
        },
        { message: 'Date des dernières règles invalide' },
      ),

    // Direct week entry branch
    currentWeek: z
      .number()
      .min(1, 'Minimum 1 semaine')
      .max(40, 'Maximum 40 semaines')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.entryMethod === 'lmp' && !data.lmpDate) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        message: 'La date de vos dernières règles est requise',
        path:    ['lmpDate'],
      });
    }
    if (data.entryMethod === 'week' && data.currentWeek === undefined) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        message: 'Veuillez indiquer votre semaine de grossesse',
        path:    ['currentWeek'],
      });
    }
  });

export type PregnancySetupFormValues = z.infer<typeof pregnancySetupSchema>;

// ─────────────────────────────────────────────────────────────
//  POSTPARTUM / BABY SETUP
// ─────────────────────────────────────────────────────────────

export const postpartumSetupSchema = z.object({
  babyName: z
    .string({ required_error: 'Le prénom de bébé est requis' })
    .min(1, 'Le prénom est requis')
    .max(50, 'Trop long')
    .trim(),
  birthDate: z
    .string({ required_error: 'La date de naissance est requise' })
    .regex(isoDateRegex, 'Format attendu : AAAA-MM-JJ')
    .refine(
      (val) => {
        const d   = new Date(val);
        if (isNaN(d.getTime())) return false;
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
        return diffDays >= 0 && diffDays <= 730; // born within last 2 years
      },
      { message: 'Date de naissance invalide (dans les 2 dernières années)' },
    ),
  gender: z.enum(['female', 'male', 'unknown'], {
    required_error: 'Veuillez choisir le sexe',
  }),
  birthWeightGrams: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        const n = parseInt(val, 10);
        return !isNaN(n) && n >= 400 && n <= 6000;
      },
      { message: 'Poids invalide (entre 400 g et 6 000 g)' },
    ),
  birthHeightCm: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        const n = parseFloat(val);
        return !isNaN(n) && n >= 30 && n <= 65;
      },
      { message: 'Taille invalide (entre 30 cm et 65 cm)' },
    ),
});

export type PostpartumSetupFormValues = z.infer<typeof postpartumSetupSchema>;

// ─────────────────────────────────────────────────────────────
//  ONBOARDING WIZARD STATE (driven by onboarding store)
// ─────────────────────────────────────────────────────────────

export interface OnboardingWizardState {
  currentStep:    OnboardingStep;
  profile:        Partial<InitialProfileFormValues>;
  phase:          import('@types/models').UserPhase | null;
  pregnancyData:  Partial<PregnancySetupFormValues> | null;
  babyData:       Partial<PostpartumSetupFormValues> | null;
}

export type OnboardingStep =
  | 'slides'
  | 'profile'
  | 'journey'
  | 'pregnancy_setup'
  | 'postpartum_setup'
  | 'complete';
