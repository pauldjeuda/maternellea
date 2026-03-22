/**
 * features/profile/types/index.ts
 *
 * Types and Zod schemas for the profile module.
 * UserProfile model lives in @types/models — these are form-level types.
 */

import { z } from 'zod';
import type { UserPhase } from '@types/models';

// ─────────────────────────────────────────────────────────────
//  EDIT PROFILE FORM
// ─────────────────────────────────────────────────────────────

export const editProfileSchema = z.object({
  firstName: z
    .string({ required_error: 'Le prénom est requis' })
    .min(2, 'Au moins 2 caractères')
    .max(50, 'Trop long')
    .trim(),
  dateOfBirth: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      if (isNaN(d.getTime())) return false;
      const age = new Date().getFullYear() - d.getFullYear();
      return age >= 13 && age <= 70;
    }, { message: 'Date invalide (13–70 ans)' }),
  country: z
    .string({ required_error: 'Le pays est requis' })
    .min(2, 'Pays requis'),
  language: z.enum(['fr', 'en']).default('fr'),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;

// ─────────────────────────────────────────────────────────────
//  NOTIFICATION PREFERENCES FORM
// ─────────────────────────────────────────────────────────────

export const notifPrefsSchema = z.object({
  notificationsEnabled:        z.boolean().default(true),
  cycleReminderEnabled:        z.boolean().default(true),
  appointmentReminderEnabled:  z.boolean().default(true),
  vaccineReminderEnabled:      z.boolean().default(true),
  weeklyDigestEnabled:         z.boolean().default(true),
});

export type NotifPrefsFormValues = z.infer<typeof notifPrefsSchema>;

// ─────────────────────────────────────────────────────────────
//  LOCAL APP PREFERENCES  (stored separately from UserProfile)
// ─────────────────────────────────────────────────────────────

export interface AppPreferences {
  theme:          'light' | 'dark' | 'system';
  language:       'fr' | 'en';
  useHaptics:     boolean;
  useBiometrics:  boolean;
  dateFormat:     'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  weightUnit:     'kg' | 'lbs';
  heightUnit:     'cm' | 'in';
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  theme:          'system',
  language:       'fr',
  useHaptics:     true,
  useBiometrics:  false,
  dateFormat:     'DD/MM/YYYY',
  weightUnit:     'kg',
  heightUnit:     'cm',
};

// ─────────────────────────────────────────────────────────────
//  CHANGE JOURNEY FORM
// ─────────────────────────────────────────────────────────────

export interface JourneyOption {
  phase:       UserPhase;
  label:       string;
  emoji:       string;
  description: string;
  color:       string;
  bgColor:     string;
}

export const JOURNEY_OPTIONS: JourneyOption[] = [
  {
    phase:       'cycle',
    label:       'Suivi du cycle',
    emoji:       '🌙',
    description: 'Suivez vos règles, symptômes et fenêtre fertile.',
    color:       '#F53D6B',
    bgColor:     '#FFF0F3',
  },
  {
    phase:       'pregnancy',
    label:       'Grossesse',
    emoji:       '🤰',
    description: 'Accompagnement semaine par semaine pendant votre grossesse.',
    color:       '#A367A1',
    bgColor:     '#F9F0F9',
  },
  {
    phase:       'postpartum',
    label:       'Post-partum & Bébé',
    emoji:       '👶',
    description: 'Récupération, suivi de bébé, carnet de santé.',
    color:       '#FF7A40',
    bgColor:     '#FFF4EE',
  },
];

// ─────────────────────────────────────────────────────────────
//  APP VERSION (static)
// ─────────────────────────────────────────────────────────────

export const APP_VERSION  = '1.0.0';
export const BUILD_NUMBER = '100';
