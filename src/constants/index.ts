/**
 * constants/index.ts
 * Centralises every hard-coded value.
 * Import from '@constants' anywhere in the codebase.
 */

// ─────────────────────────────────────────────────────────────
//  APP META
// ─────────────────────────────────────────────────────────────

export const APP_NAME    = 'Maternellea' as const;
export const APP_VERSION = '1.0.0' as const;
export const APP_BUNDLE  = 'com.maternellea.app' as const;

// ─────────────────────────────────────────────────────────────
//  ASYNC STORAGE / MMKV KEYS
// ─────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN:          '@mat/auth_token',
  REFRESH_TOKEN:       '@mat/refresh_token',
  USER_PROFILE:        '@mat/user_profile',
  ONBOARDING_DONE:     '@mat/onboarding_done',

  // Feature stores (Zustand persist keys)
  STORE_AUTH:          'store/auth',
  STORE_CYCLE:         'store/cycle',
  STORE_PREGNANCY:     'store/pregnancy',
  STORE_BABY:          'store/baby',
  STORE_ADVICE:        'store/advice',

  // Preferences
  NOTIFICATION_PREFS:  '@mat/notification_prefs',
  LANGUAGE:            '@mat/language',
  COUNTRY:             '@mat/country',

  // Cache
  LAST_SYNC:           '@mat/last_sync',
} as const;

// ─────────────────────────────────────────────────────────────
//  CYCLE DEFAULTS
// ─────────────────────────────────────────────────────────────

export const CYCLE = {
  DEFAULT_LENGTH_DAYS:    28,
  DEFAULT_PERIOD_DAYS:    5,
  MIN_LENGTH_DAYS:        21,
  MAX_LENGTH_DAYS:        35,
  OVULATION_BEFORE_NEXT:  14,   // ovulation = next period - 14 days
  FERTILE_DAYS_BEFORE:    5,    // fertile window starts 5 days before ovulation
  FERTILE_DAYS_AFTER:     1,    // fertile window ends 1 day after ovulation
  MIN_CYCLES_FOR_HIGH_CONFIDENCE: 3,
  MIN_CYCLES_FOR_MED_CONFIDENCE:  1,
} as const;

// ─────────────────────────────────────────────────────────────
//  PREGNANCY
// ─────────────────────────────────────────────────────────────

export const PREGNANCY = {
  TOTAL_WEEKS:         40,
  DAYS:                280,           // lmpDate + 280 = dueDate
  TRIMESTER_1_END:     13,
  TRIMESTER_2_END:     26,
  TRIMESTER_3_END:     40,
  TERM_MIN_WEEKS:      37,
  TERM_MAX_WEEKS:      42,
} as const;

// ─────────────────────────────────────────────────────────────
//  BABY
// ─────────────────────────────────────────────────────────────

export const BABY = {
  MAX_BABIES:   5,
  FIRST_YEAR_MONTHS: 12,
  WEIGHT_MIN_GRAMS:  400,
  WEIGHT_MAX_GRAMS:  9000,
  HEIGHT_MIN_CM:     30,
  HEIGHT_MAX_CM:     100,
} as const;

// ─────────────────────────────────────────────────────────────
//  LABEL MAPS  (used across multiple features)
// ─────────────────────────────────────────────────────────────

export const SYMPTOM_LABELS: Record<string, string> = {
  cramps:            'Crampes',
  headache:          'Maux de tête',
  fatigue:           'Fatigue',
  bloating:          'Ballonnements',
  breast_tenderness: 'Sensibilité poitrine',
  mood_swings:       "Sautes d'humeur",
  spotting:          'Spotting',
  discharge:         'Pertes',
  nausea:            'Nausée',
  backache:          'Mal de dos',
  acne:              'Acné',
  insomnia:          'Insomnie',
  other:             'Autre',
};

export const POSTPARTUM_SYMPTOM_LABELS: Record<string, string> = {
  perineal_pain:      'Douleur périnéale',
  breast_engorgement: 'Engorgement mammaire',
  mastitis:           'Mastite',
  baby_blues:         'Baby blues',
  insomnia:           'Insomnie',
  fatigue:            'Fatigue intense',
  anxiety:            'Anxiété',
  hair_loss:          'Chute de cheveux',
  night_sweats:       'Sueurs nocturnes',
  incontinence:       'Incontinence',
  other:              'Autre',
};

export const MOOD_LABELS: Record<number, string> = {
  1: 'Très bas',
  2: 'Bas',
  3: 'Neutre',
  4: 'Bien',
  5: 'Excellent',
};

export const MOOD_EMOJIS: Record<number, string> = {
  1: '😔',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
};

export const FATIGUE_LABELS: Record<number, string> = {
  1: 'Reposée',
  2: 'Légère fatigue',
  3: 'Fatiguée',
  4: 'Très fatiguée',
  5: 'Épuisée',
};

export const PAIN_LABELS: Record<number, string> = {
  0: 'Aucune',
  1: 'Très légère',
  2: 'Légère',
  3: 'Modérée',
  4: 'Forte',
  5: 'Très forte',
};

export const FLOW_LABELS: Record<string, string> = {
  spotting: 'Spotting',
  light:    'Légères',
  medium:   'Moyennes',
  heavy:    'Abondantes',
};

export const VACCINE_STATUS_LABELS: Record<string, string> = {
  upcoming:  'À venir',
  due_soon:  'Bientôt',
  done:      'Effectué',
  overdue:   'En retard',
  skipped:   'Ignoré',
};

export const PHASE_LABELS: Record<string, string> = {
  cycle:      'Suivi du cycle',
  pregnancy:  'Je suis enceinte',
  postpartum: "J'ai accouché",
};

export const PHASE_EMOJIS: Record<string, string> = {
  cycle:      '🌙',
  pregnancy:  '🤰',
  postpartum: '👶',
};

export const TRIMESTER_LABELS: Record<number, string> = {
  1: '1er trimestre',
  2: '2ème trimestre',
  3: '3ème trimestre',
};

export const ARTICLE_CATEGORY_LABELS: Record<string, string> = {
  cycle:         'Cycle',
  pregnancy:     'Grossesse',
  postpartum:    'Post-partum',
  baby:          'Bébé',
  nutrition:     'Nutrition',
  wellbeing:     'Bien-être',
  mental_health: 'Santé mentale',
};

export const GENDER_LABELS: Record<string, string> = {
  female:  'Fille',
  male:    'Garçon',
  unknown: 'Surprise',
};

export const GENDER_EMOJIS: Record<string, string> = {
  female:  '👧',
  male:    '👦',
  unknown: '🍼',
};

// ─────────────────────────────────────────────────────────────
//  COUNTRIES
// ─────────────────────────────────────────────────────────────

export const COUNTRIES = [
  { code: 'FR',    name: 'France' },
  { code: 'BE',    name: 'Belgique' },
  { code: 'CH',    name: 'Suisse' },
  { code: 'LU',    name: 'Luxembourg' },
  { code: 'CA',    name: 'Canada' },
  { code: 'SN',    name: 'Sénégal' },
  { code: 'CI',    name: "Côte d'Ivoire" },
  { code: 'CM',    name: 'Cameroun' },
  { code: 'MA',    name: 'Maroc' },
  { code: 'DZ',    name: 'Algérie' },
  { code: 'TN',    name: 'Tunisie' },
  { code: 'MG',    name: 'Madagascar' },
  { code: 'CD',    name: 'Congo RDC' },
  { code: 'GN',    name: 'Guinée' },
  { code: 'BJ',    name: 'Bénin' },
  { code: 'TG',    name: 'Togo' },
  { code: 'OTHER', name: 'Autre pays' },
] as const;

export type CountryCode = typeof COUNTRIES[number]['code'];

// ─────────────────────────────────────────────────────────────
//  REMINDER DEFAULTS
// ─────────────────────────────────────────────────────────────

export const REMINDER_DEFAULTS = {
  APPOINTMENT_MINUTES_BEFORE: 60,
  VACCINE_DAYS_BEFORE:        7,
  PERIOD_DAYS_BEFORE:         2,
} as const;

// ─────────────────────────────────────────────────────────────
//  VACCINE CALENDAR (FR — generic baseline)
// ─────────────────────────────────────────────────────────────

export const VACCINE_SCHEDULE_FR = [
  { id: 'bcg',      name: 'BCG',                   shortName: 'BCG',        ageMonths: 0,  ageLabel: 'Naissance',   diseases: ['Tuberculose'],                                     doses: 1, mandatory: false },
  { id: 'hexa-1',   name: 'Hexavalent — dose 1',   shortName: 'Hexa 1',     ageMonths: 2,  ageLabel: '2 mois',      diseases: ['Diphtérie','Tétanos','Polio','Coqueluche','Hib','HepB'], doses: 3, mandatory: true  },
  { id: 'pneumo-1', name: 'Pneumocoque — dose 1',  shortName: 'Pneumo 1',   ageMonths: 2,  ageLabel: '2 mois',      diseases: ['Pneumocoque'],                                    doses: 3, mandatory: true  },
  { id: 'menb-1',   name: 'Méningocoque B — d. 1', shortName: 'MenB 1',     ageMonths: 3,  ageLabel: '3 mois',      diseases: ['Méningocoque B'],                                 doses: 3, mandatory: false },
  { id: 'hexa-2',   name: 'Hexavalent — dose 2',   shortName: 'Hexa 2',     ageMonths: 4,  ageLabel: '4 mois',      diseases: ['Diphtérie','Tétanos','Polio','Coqueluche','Hib','HepB'], doses: 3, mandatory: true  },
  { id: 'pneumo-2', name: 'Pneumocoque — dose 2',  shortName: 'Pneumo 2',   ageMonths: 4,  ageLabel: '4 mois',      diseases: ['Pneumocoque'],                                    doses: 3, mandatory: true  },
  { id: 'menb-2',   name: 'Méningocoque B — d. 2', shortName: 'MenB 2',     ageMonths: 5,  ageLabel: '5 mois',      diseases: ['Méningocoque B'],                                 doses: 3, mandatory: false },
  { id: 'hexa-3',   name: 'Hexavalent — dose 3',   shortName: 'Hexa 3',     ageMonths: 11, ageLabel: '11 mois',     diseases: ['Diphtérie','Tétanos','Polio','Coqueluche','Hib','HepB'], doses: 3, mandatory: true  },
  { id: 'pneumo-3', name: 'Pneumocoque — dose 3',  shortName: 'Pneumo 3',   ageMonths: 11, ageLabel: '11 mois',     diseases: ['Pneumocoque'],                                    doses: 3, mandatory: true  },
  { id: 'menb-3',   name: 'Méningocoque B — d. 3', shortName: 'MenB 3',     ageMonths: 12, ageLabel: '12 mois',     diseases: ['Méningocoque B'],                                 doses: 3, mandatory: false },
  { id: 'ror-1',    name: 'ROR — dose 1',           shortName: 'ROR 1',      ageMonths: 12, ageLabel: '12 mois',     diseases: ['Rougeole','Oreillons','Rubéole'],                 doses: 2, mandatory: true  },
  { id: 'men-c',    name: 'Méningocoque C',         shortName: 'MenC',       ageMonths: 12, ageLabel: '12 mois',     diseases: ['Méningocoque C'],                                 doses: 1, mandatory: true  },
  { id: 'var-1',    name: 'Varicelle — dose 1',     shortName: 'Varicelle 1',ageMonths: 12, ageLabel: '12 mois',     diseases: ['Varicelle'],                                      doses: 2, mandatory: false },
  { id: 'ror-2',    name: 'ROR — dose 2',           shortName: 'ROR 2',      ageMonths: 16, ageLabel: '16-18 mois',  diseases: ['Rougeole','Oreillons','Rubéole'],                 doses: 2, mandatory: true  },
  { id: 'dtp-6a',   name: 'DTP + Coqueluche',       shortName: 'dTcaP',      ageMonths: 72, ageLabel: '6 ans',       diseases: ['Diphtérie','Tétanos','Polio','Coqueluche'],       doses: 1, mandatory: true  },
] as const;
