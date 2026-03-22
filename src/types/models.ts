/**
 * types/models.ts
 * All domain models for the Maternellea application.
 * These types flow throughout the entire codebase — stores, services, screens.
 */

// ─────────────────────────────────────────────────────────────
//  PRIMITIVES / ENUMS
// ─────────────────────────────────────────────────────────────

/** ISO 8601 date string: "YYYY-MM-DD" */
export type ISODate = string;

/** ISO 8601 datetime string: "YYYY-MM-DDTHH:mm:ssZ" */
export type ISODateTime = string;

/** Active lifecycle phase of the user */
export type UserPhase = 'cycle' | 'pregnancy' | 'postpartum';

/** Baby biological sex */
export type Gender = 'female' | 'male' | 'unknown';

/** 1 (worst) → 5 (best) */
export type MoodLevel = 1 | 2 | 3 | 4 | 5;

/** 1 (energetic) → 5 (exhausted) */
export type FatigueLevel = 1 | 2 | 3 | 4 | 5;

/** 0 (none) → 5 (severe) */
export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** Menstrual flow intensity */
export type FlowIntensity = 'spotting' | 'light' | 'medium' | 'heavy';

/** Vaccine lifecycle status */
export type VaccineStatus = 'upcoming' | 'due_soon' | 'done' | 'overdue' | 'skipped';

/** Content article category */
export type ArticleCategory =
  | 'cycle'
  | 'pregnancy'
  | 'postpartum'
  | 'baby'
  | 'nutrition'
  | 'wellbeing'
  | 'mental_health';

// ─────────────────────────────────────────────────────────────
//  USER & PROFILE
// ─────────────────────────────────────────────────────────────

export interface User {
  id:            string;
  email:         string;
  firstName:     string;
  dateOfBirth?:  ISODate;
  country:       string;       // ISO 3166-1 alpha-2 ("FR", "CM"…)
  language:      string;       // BCP 47 ("fr", "en"…)
  activePhase:   UserPhase;
  createdAt:     ISODateTime;
  updatedAt:     ISODateTime;
}

export interface UserProfile extends User {
  avatarUri?:                    string;
  notificationsEnabled:          boolean;
  cycleReminderEnabled:          boolean;
  appointmentReminderEnabled:    boolean;
  vaccineReminderEnabled:        boolean;
  weeklyDigestEnabled:           boolean;
}

// ─────────────────────────────────────────────────────────────
//  CYCLE
// ─────────────────────────────────────────────────────────────

export type SymptomType =
  | 'cramps'
  | 'headache'
  | 'fatigue'
  | 'bloating'
  | 'breast_tenderness'
  | 'mood_swings'
  | 'spotting'
  | 'discharge'
  | 'nausea'
  | 'backache'
  | 'acne'
  | 'insomnia'
  | 'other';

export interface SymptomEntry {
  id:         string;
  date:       ISODate;
  symptoms:   SymptomType[];
  mood:       MoodLevel;
  fatigue:    FatigueLevel;
  pain:       PainLevel;
  flow?:      FlowIntensity;
  notes?:     string;
  createdAt:  ISODateTime;
  updatedAt?: ISODateTime;
}

export interface CycleEntry {
  id:              string;
  startDate:       ISODate;
  endDate?:        ISODate;
  durationDays?:   number;
  cycleLengthDays?: number;  // days until next cycle started
  flow?:           FlowIntensity;
  notes?:          string;
  createdAt:       ISODateTime;
  updatedAt?:      ISODateTime;
}

export interface CyclePrediction {
  nextPeriodStart:      ISODate;
  nextPeriodEnd:        ISODate;
  ovulationDate:        ISODate;
  fertileWindowStart:   ISODate;
  fertileWindowEnd:     ISODate;
  averageCycleLength:   number;
  averagePeriodLength:  number;
  confidence:           'low' | 'medium' | 'high';  // based on # of past cycles
}

// ─────────────────────────────────────────────────────────────
//  PREGNANCY
// ─────────────────────────────────────────────────────────────

export type Trimester = 1 | 2 | 3;

export interface PregnancyProfile {
  id:           string;
  userId:       string;
  lmpDate:      ISODate;     // last menstrual period
  dueDate:      ISODate;     // computed: lmpDate + 280 days
  currentWeek:  number;      // 0–40
  currentDay:   number;      // 0–6
  trimester:    Trimester;
  isActive:     boolean;
  createdAt:    ISODateTime;
  updatedAt?:   ISODateTime;
}

export interface WeeklyContent {
  week:              number;
  babySize:          string;      // "une framboise"
  babySizeCm:        number;
  babyWeightGrams:   number;
  babyDevelopment:   string;
  motherChanges:     string;
  nutritionTip:      string;
  wellbeingTip?:     string;
  warningSign?:      string;
  checkupNote?:      string;
  emoji:             string;
}

export interface Appointment {
  id:                string;
  title:             string;
  date:              ISODateTime;
  endDate?:          ISODateTime;
  location?:         string;
  address?:          string;
  doctorName?:       string;
  speciality?:       string;
  notes?:            string;
  reminderEnabled:   boolean;
  reminderMinutes?:  number;   // minutes before
  isCompleted:       boolean;
  completedAt?:      ISODateTime;
  phase:             UserPhase;
  createdAt:         ISODateTime;
  updatedAt?:        ISODateTime;
}

export interface MedicalExam {
  id:              string;
  type:            string;
  scheduledDate:   ISODate;
  completedDate?:  ISODate;
  result?:         string;
  labName?:        string;
  doctorName?:     string;
  notes?:          string;
  fileUri?:        string;   // local file path for attached result
  isCompleted:     boolean;
  phase:           UserPhase;
  createdAt:       ISODateTime;
}

export interface PregnancyJournalEntry {
  id:         string;
  date:       ISODate;
  week:       number;
  content:    string;
  mood:       MoodLevel;
  photoUri?:  string;
  tags?:      string[];
  createdAt:  ISODateTime;
  updatedAt?: ISODateTime;
}

export interface WeightEntry {
  id:         string;
  date:       ISODate;
  weightKg:   number;
  notes?:     string;
  phase:      UserPhase;
  createdAt:  ISODateTime;
}

// ─────────────────────────────────────────────────────────────
//  POST-PARTUM
// ─────────────────────────────────────────────────────────────

export type PostpartumSymptom =
  | 'perineal_pain'
  | 'breast_engorgement'
  | 'mastitis'
  | 'baby_blues'
  | 'insomnia'
  | 'fatigue'
  | 'anxiety'
  | 'hair_loss'
  | 'night_sweats'
  | 'incontinence'
  | 'other';

export interface PostpartumEntry {
  id:         string;
  date:       ISODate;
  mood:       MoodLevel;
  fatigue:    FatigueLevel;
  pain:       PainLevel;
  symptoms:   PostpartumSymptom[];
  isBreastfeeding?: boolean;
  notes?:     string;
  createdAt:  ISODateTime;
}

// ─────────────────────────────────────────────────────────────
//  BABY
// ─────────────────────────────────────────────────────────────

export interface BabyProfile {
  id:                      string;
  name:                    string;
  birthDate:               ISODate;
  birthTime?:              string;    // "HH:mm"
  gender:                  Gender;
  birthWeightGrams?:       number;
  birthHeightCm?:          number;
  birthHeadCircumferenceCm?: number;
  photoUri?:               string;
  bloodType?:              string;
  pediatricianName?:       string;
  maternityName?:          string;
  notes?:                  string;
  isActive:                boolean;
  createdAt:               ISODateTime;
  updatedAt?:              ISODateTime;
}

export interface GrowthEntry {
  id:                      string;
  babyId:                  string;
  date:                    ISODate;
  ageMonths:               number;
  weightGrams:             number;
  heightCm:                number;
  headCircumferenceCm?:    number;
  notes?:                  string;
  measuredBy?:             string;
  createdAt:               ISODateTime;
}

// ─────────────────────────────────────────────────────────────
//  VACCINES
// ─────────────────────────────────────────────────────────────

export interface Vaccine {
  id:                   string;
  name:                 string;
  shortName:            string;
  description:          string;
  recommendedAgeMonths: number;
  recommendedAgeLabel:  string;   // "2 mois", "6 ans"
  diseases:             string[];
  numberOfDoses:        number;
  isOptional:           boolean;
  isMandatory:          boolean;
  countryCode?:         string;   // null = universal
  notes?:               string;
}

export interface VaccineRecord {
  id:                string;
  babyId:            string;
  vaccineId:         string;
  vaccine:           Vaccine;
  status:            VaccineStatus;
  scheduledDate?:    ISODate;
  administeredDate?: ISODate;
  doseNumber?:       number;
  batchNumber?:      string;
  administeredBy?:   string;
  location?:         string;
  sideEffects?:      string;
  notes?:            string;
  nextDoseDate?:     ISODate;
  createdAt:         ISODateTime;
  updatedAt?:        ISODateTime;
}

// ─────────────────────────────────────────────────────────────
//  NOTIFICATIONS / REMINDERS
// ─────────────────────────────────────────────────────────────

export type ReminderType =
  | 'period_prediction'
  | 'appointment'
  | 'vaccine'
  | 'weekly_pregnancy'
  | 'postpartum_checkup'
  | 'custom';

export interface Reminder {
  id:               string;
  type:             ReminderType;
  title:            string;
  body:             string;
  scheduledDate:    ISODateTime;
  isRecurring:      boolean;
  recurringDays?:   number;
  linkedEntityId?:  string;
  linkedEntityType?: 'appointment' | 'vaccine' | 'cycle';
  isActive:         boolean;
  firedAt?:         ISODateTime;
  createdAt:        ISODateTime;
}

// ─────────────────────────────────────────────────────────────
//  CONTENT / ARTICLES
// ─────────────────────────────────────────────────────────────

export interface Article {
  id:               string;
  title:            string;
  summary:          string;
  content:          string;
  category:         ArticleCategory;
  readTimeMinutes:  number;
  coverImageUri?:   string;
  author?:          string;
  isFavorite:       boolean;
  isBookmarked:     boolean;
  publishedAt:      ISODate;
  tags:             string[];
  relatedArticleIds?: string[];
}

// ─────────────────────────────────────────────────────────────
//  API / SERVICE LAYER
// ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data:     T;
  success:  boolean;
  message?: string;
}

export interface ApiError {
  code:     string;
  message:  string;
  status:   number;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data:       T[];
  total:      number;
  page:       number;
  pageSize:   number;
  hasMore:    boolean;
}

// ─────────────────────────────────────────────────────────────
//  STORE SHAPE
// ─────────────────────────────────────────────────────────────

export interface LoadingState {
  isLoading:  boolean;
  error:      string | null;
}

// ─────────────────────────────────────────────────────────────
//  FORM SCHEMAS (Zod-inferred, declared here as TS types)
// ─────────────────────────────────────────────────────────────

export interface LoginFormValues {
  email:    string;
  password: string;
}

export interface RegisterFormValues {
  firstName:       string;
  email:           string;
  password:        string;
  confirmPassword: string;
}

export interface AddPeriodFormValues {
  startDate:  ISODate;
  endDate?:   ISODate;
  flow?:      FlowIntensity;
  notes?:     string;
}

export interface AddSymptomFormValues {
  date:      ISODate;
  symptoms:  SymptomType[];
  mood:      MoodLevel;
  fatigue:   FatigueLevel;
  pain:      PainLevel;
  notes?:    string;
}

export interface AddAppointmentFormValues {
  title:            string;
  date:             ISODate;
  time:             string;   // "HH:mm"
  location?:        string;
  doctorName?:      string;
  notes?:           string;
  reminderEnabled:  boolean;
  reminderMinutes?: number;
}

export interface AddVaccineRecordFormValues {
  vaccineId:         string;
  administeredDate:  ISODate;
  batchNumber?:      string;
  administeredBy?:   string;
  location?:         string;
  notes?:            string;
}

export interface AddGrowthEntryFormValues {
  date:                    ISODate;
  weightGrams:             number;
  heightCm:                number;
  headCircumferenceCm?:    number;
  notes?:                  string;
}
