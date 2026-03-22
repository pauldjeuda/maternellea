/**
 * services/mocks/dashboardData.ts
 *
 * Realistic mock data seeded for the three home dashboard variants.
 * All dates are computed relative to "today" at runtime so they
 * remain relevant regardless of when the app is opened.
 */

import { addDays, subDays, addMonths, subMonths, format } from 'date-fns';
import type {
  CycleEntry, SymptomEntry, CyclePrediction,
  PregnancyProfile, WeeklyContent, Appointment,
  BabyProfile, GrowthEntry, VaccineRecord, Vaccine,
  Article, PostpartumEntry,
} from '@types/models';

const today   = new Date();
const d = (offset: number) => format(addDays(today, offset), 'yyyy-MM-dd');
const s = (offset: number) => format(subDays(today, offset), 'yyyy-MM-dd');
const dt = (offsetDays: number, hour = 10, min = 0) => {
  const base = addDays(today, offsetDays);
  base.setHours(hour, min, 0, 0);
  return base.toISOString();
};

// ─────────────────────────────────────────────────────────────
//  CYCLE MOCK
// ─────────────────────────────────────────────────────────────

export const MOCK_CYCLE_ENTRIES: CycleEntry[] = [
  {
    id: 'cy-001', startDate: s(28), endDate: s(23),
    durationDays: 5, cycleLengthDays: 28, flow: 'medium',
    createdAt: s(28) + 'T08:00:00Z',
  },
  {
    id: 'cy-002', startDate: s(56), endDate: s(51),
    durationDays: 5, cycleLengthDays: 29, flow: 'heavy',
    createdAt: s(56) + 'T08:00:00Z',
  },
  {
    id: 'cy-003', startDate: s(85), endDate: s(80),
    durationDays: 5, cycleLengthDays: 28, flow: 'light',
    createdAt: s(85) + 'T08:00:00Z',
  },
];

export const MOCK_SYMPTOMS: SymptomEntry[] = [
  {
    id: 'sy-001', date: s(3),
    symptoms: ['fatigue', 'mood_swings'], mood: 3, fatigue: 4, pain: 1,
    notes: 'Journée difficile, beaucoup de fatigue.',
    createdAt: s(3) + 'T20:00:00Z',
  },
  {
    id: 'sy-002', date: s(2),
    symptoms: ['bloating', 'breast_tenderness'], mood: 3, fatigue: 3, pain: 2,
    createdAt: s(2) + 'T20:00:00Z',
  },
  {
    id: 'sy-003', date: s(1),
    symptoms: ['cramps', 'headache'], mood: 2, fatigue: 4, pain: 3,
    notes: 'Crampes légères en fin de journée.',
    createdAt: s(1) + 'T21:00:00Z',
  },
];

// Prediction computed so next period is in ~11 days
export const MOCK_CYCLE_PREDICTION: CyclePrediction = {
  nextPeriodStart:    d(11),
  nextPeriodEnd:      d(15),
  ovulationDate:      d(-3),  // ovulation was 3 days ago
  fertileWindowStart: d(-8),
  fertileWindowEnd:   d(-2),
  averageCycleLength: 28,
  averagePeriodLength: 5,
  confidence: 'high',
};

// ─────────────────────────────────────────────────────────────
//  PREGNANCY MOCK  (SA 22 + 3)
// ─────────────────────────────────────────────────────────────

// lmpDate = today - (22*7 + 3) days
const lmpOffset  = 22 * 7 + 3;
const lmpDateObj = subDays(today, lmpOffset);
const dueDateObj = addDays(lmpDateObj, 280);

export const MOCK_PREGNANCY: PregnancyProfile = {
  id:          'preg-001',
  userId:      'user-001',
  lmpDate:     format(lmpDateObj, 'yyyy-MM-dd'),
  dueDate:     format(dueDateObj, 'yyyy-MM-dd'),
  currentWeek: 22,
  currentDay:  3,
  trimester:   2,
  isActive:    true,
  createdAt:   format(lmpDateObj, 'yyyy-MM-dd') + 'T10:00:00Z',
};

export const MOCK_WEEKLY_CONTENT: WeeklyContent = {
  week:            22,
  babySize:        'un épi de maïs',
  babySizeCm:      27.8,
  babyWeightGrams: 430,
  emoji:           '🌽',
  babyDevelopment:
    'Votre bébé commence à percevoir les sons extérieurs et peut sursauter au bruit. ' +
    'Ses paupières se séparent et il peut désormais ouvrir les yeux. ' +
    'Ses empreintes digitales sont pleinement formées.',
  motherChanges:
    'Le fond utérin atteint le niveau du nombril. ' +
    'Vous pouvez ressentir des mouvements réguliers — profitez-en ! ' +
    'Des douleurs ligamentaires dans l\'aine sont fréquentes à ce stade.',
  nutritionTip:
    'Privilégiez les aliments riches en fer : viandes rouges maigres, lentilles, épinards. ' +
    'Combinez-les avec de la vitamine C (citron, poivron) pour une meilleure absorption.',
  wellbeingTip:
    'Pratiquez 20 à 30 min de marche douce par jour. Excellente pour la circulation et le moral.',
  checkupNote: 'Prévoyez votre consultation mensuelle et la prise de sang du 2ème trimestre.',
};

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id:             'apt-001',
    title:          'Échographie morphologique T2',
    date:           dt(6, 10, 30),
    location:       'Cabinet Dr Fontaine',
    doctorName:     'Dr Marie Fontaine',
    speciality:     'Gynécologue-obstétricienne',
    notes:          'Apporter carnet de maternité. Venir le ventre plein.',
    reminderEnabled: true,
    reminderMinutes: 60,
    isCompleted:    false,
    phase:          'pregnancy',
    createdAt:      s(10) + 'T10:00:00Z',
  },
  {
    id:             'apt-002',
    title:          'Consultation mensuelle',
    date:           dt(14, 14, 0),
    location:       'Maternité Saint-Luc',
    doctorName:     'Dr Paul Mercier',
    speciality:     'Obstétricien',
    reminderEnabled: true,
    reminderMinutes: 120,
    isCompleted:    false,
    phase:          'pregnancy',
    createdAt:      s(5) + 'T10:00:00Z',
  },
  {
    id:             'apt-003',
    title:          'Prise de sang — bilan T2',
    date:           dt(-4, 8, 0),
    location:       'Laboratoire BioAnalyse',
    reminderEnabled: false,
    isCompleted:    true,
    completedAt:    dt(-4, 9, 15),
    phase:          'pregnancy',
    createdAt:      s(20) + 'T10:00:00Z',
  },
];

export const MOCK_CHECKLIST: { id: string; label: string; done: boolean; week?: number }[] = [
  { id: 'cl-01', label: 'Commencer les cours de préparation',  done: true,  week: 20 },
  { id: 'cl-02', label: 'Choisir la maternité',                done: true,  week: 20 },
  { id: 'cl-03', label: 'Passer l\'échographie T2',            done: false, week: 22 },
  { id: 'cl-04', label: 'Rédiger le projet de naissance',      done: false, week: 24 },
  { id: 'cl-05', label: 'Préparer le sac de maternité',        done: false, week: 32 },
  { id: 'cl-06', label: 'Installer le siège auto',             done: false, week: 34 },
];

// ─────────────────────────────────────────────────────────────
//  POSTPARTUM / BABY MOCK
// ─────────────────────────────────────────────────────────────

// Baby born 3 months and 12 days ago
const birthDateObj = subMonths(subDays(today, 12), 3);

export const MOCK_BABY: BabyProfile = {
  id:                    'baby-001',
  name:                  'Léa',
  birthDate:             format(birthDateObj, 'yyyy-MM-dd'),
  gender:                'female',
  birthWeightGrams:      3340,
  birthHeightCm:         50,
  birthHeadCircumferenceCm: 34,
  pediatricianName:      'Dr Claire Vidal',
  isActive:              true,
  createdAt:             format(birthDateObj, 'yyyy-MM-dd') + 'T14:30:00Z',
};

export const MOCK_GROWTH_ENTRIES: GrowthEntry[] = [
  {
    id: 'gr-001', babyId: 'baby-001',
    date: format(birthDateObj, 'yyyy-MM-dd'), ageMonths: 0,
    weightGrams: 3340, heightCm: 50, headCircumferenceCm: 34,
    measuredBy: 'Maternité', createdAt: format(birthDateObj, 'yyyy-MM-dd') + 'T15:00:00Z',
  },
  {
    id: 'gr-002', babyId: 'baby-001',
    date: format(addMonths(birthDateObj, 1), 'yyyy-MM-dd'), ageMonths: 1,
    weightGrams: 4280, heightCm: 53.5, headCircumferenceCm: 36.5,
    measuredBy: 'Dr Vidal', createdAt: format(addMonths(birthDateObj, 1), 'yyyy-MM-dd') + 'T10:00:00Z',
  },
  {
    id: 'gr-003', babyId: 'baby-001',
    date: format(addMonths(birthDateObj, 2), 'yyyy-MM-dd'), ageMonths: 2,
    weightGrams: 5150, heightCm: 57, headCircumferenceCm: 38.5,
    measuredBy: 'Dr Vidal', createdAt: format(addMonths(birthDateObj, 2), 'yyyy-MM-dd') + 'T10:00:00Z',
  },
  {
    id: 'gr-004', babyId: 'baby-001',
    date: s(4), ageMonths: 3,
    weightGrams: 6020, heightCm: 60, headCircumferenceCm: 40,
    measuredBy: 'Dr Vidal', createdAt: s(4) + 'T10:00:00Z',
  },
];

const mockVaccineBase: Vaccine = {
  id: 'hexa-2', name: 'Hexavalent — dose 2', shortName: 'Hexa 2',
  description: 'Vaccin contre diphtérie, tétanos, polio, coqueluche, Hib, hépatite B',
  recommendedAgeMonths: 4, recommendedAgeLabel: '4 mois',
  diseases: ['Diphtérie','Tétanos','Polio','Coqueluche','Hib','HepB'],
  numberOfDoses: 3, isOptional: false, isMandatory: true,
};

export const MOCK_VACCINE_RECORDS: VaccineRecord[] = [
  {
    id: 'vr-001', babyId: 'baby-001', vaccineId: 'bcg',
    vaccine: { ...mockVaccineBase, id: 'bcg', name: 'BCG', shortName: 'BCG', recommendedAgeMonths: 0, recommendedAgeLabel: 'Naissance', diseases: ['Tuberculose'], isMandatory: false },
    status: 'done',
    scheduledDate: format(birthDateObj, 'yyyy-MM-dd'),
    administeredDate: format(birthDateObj, 'yyyy-MM-dd'),
    administeredBy: 'Sage-femme',
    createdAt: format(birthDateObj, 'yyyy-MM-dd') + 'T16:00:00Z',
  },
  {
    id: 'vr-002', babyId: 'baby-001', vaccineId: 'hexa-1',
    vaccine: { ...mockVaccineBase, id: 'hexa-1', name: 'Hexavalent — dose 1', shortName: 'Hexa 1', recommendedAgeMonths: 2, recommendedAgeLabel: '2 mois' },
    status: 'done',
    scheduledDate: format(addMonths(birthDateObj, 2), 'yyyy-MM-dd'),
    administeredDate: format(addMonths(birthDateObj, 2), 'yyyy-MM-dd'),
    administeredBy: 'Dr Vidal',
    createdAt: format(addMonths(birthDateObj, 2), 'yyyy-MM-dd') + 'T10:30:00Z',
  },
  {
    id: 'vr-003', babyId: 'baby-001', vaccineId: 'hexa-2',
    vaccine: mockVaccineBase,
    status: 'due_soon',
    scheduledDate: d(8),
    createdAt: s(5) + 'T10:00:00Z',
  },
  {
    id: 'vr-004', babyId: 'baby-001', vaccineId: 'ror-1',
    vaccine: { ...mockVaccineBase, id: 'ror-1', name: 'ROR — dose 1', shortName: 'ROR 1', recommendedAgeMonths: 12, recommendedAgeLabel: '12 mois', diseases: ['Rougeole','Oreillons','Rubéole'], isMandatory: true },
    status: 'upcoming',
    scheduledDate: format(addMonths(birthDateObj, 12), 'yyyy-MM-dd'),
    createdAt: s(5) + 'T10:00:00Z',
  },
];

export const MOCK_POSTPARTUM_ENTRIES: PostpartumEntry[] = [
  {
    id: 'pp-001', date: s(2), mood: 4, fatigue: 3, pain: 1,
    symptoms: ['fatigue', 'insomnia'],
    isBreastfeeding: true,
    notes: 'Nuit correcte pour une fois ! 3 réveils seulement.',
    createdAt: s(2) + 'T21:00:00Z',
  },
  {
    id: 'pp-002', date: s(1), mood: 3, fatigue: 4, pain: 1,
    symptoms: ['fatigue'],
    isBreastfeeding: true,
    createdAt: s(1) + 'T21:00:00Z',
  },
];

// ─────────────────────────────────────────────────────────────
//  ARTICLES
// ─────────────────────────────────────────────────────────────

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'art-001',
    title: 'Comprendre votre fenêtre fertile',
    summary: 'La fenêtre fertile dure environ 6 jours par cycle. Voici comment l'identifier avec précision.',
    content: '...',
    category: 'cycle',
    readTimeMinutes: 4,
    isFavorite: false, isBookmarked: false,
    publishedAt: s(10),
    tags: ['cycle', 'ovulation', 'fertilité'],
  },
  {
    id: 'art-002',
    title: 'Alimentation au 2ème trimestre : les essentiels',
    summary: 'Fer, calcium, oméga-3 : les nutriments clés pour vous et votre bébé entre 14 et 27 SA.',
    content: '...',
    category: 'nutrition',
    readTimeMinutes: 6,
    isFavorite: true, isBookmarked: true,
    publishedAt: s(7),
    tags: ['nutrition', 'grossesse', 'vitamines'],
  },
  {
    id: 'art-003',
    title: 'Le 4ème trimestre : s\'adapter au rythme de bébé',
    summary: 'Les 3 premiers mois après la naissance sont une période d'adaptation intense pour toute la famille.',
    content: '...',
    category: 'postpartum',
    readTimeMinutes: 5,
    isFavorite: false, isBookmarked: false,
    publishedAt: s(4),
    tags: ['post-partum', 'bébé', 'récupération'],
  },
  {
    id: 'art-004',
    title: 'Yoga prénatal : 5 postures pour le 2ème trimestre',
    summary: 'Des exercices doux adaptés à la grossesse pour soulager les douleurs et renforcer le périnée.',
    content: '...',
    category: 'wellbeing',
    readTimeMinutes: 7,
    isFavorite: false, isBookmarked: false,
    publishedAt: s(2),
    tags: ['yoga', 'bien-être', 'grossesse'],
  },
];
