/**
 * features/pregnancy/services/pregnancyMocks.ts
 * All pregnancy-module mock data. Dates computed relative to today.
 */

import { addDays, subDays, format } from 'date-fns';
import type { MedicalExam, PregnancyJournalEntry, WeightEntry } from '@types/models';
import type { ChecklistItem } from '../types';

const today = new Date();
const d = (n: number) => format(addDays(today, n), 'yyyy-MM-dd');
const s = (n: number) => format(subDays(today, n), 'yyyy-MM-dd');

// ─── EXAMS ────────────────────────────────────────────────────

export const MOCK_EXAMS: MedicalExam[] = [
  {
    id: 'ex-001', type: 'Échographie T1 (12 SA)',
    scheduledDate: s(70), completedDate: s(70),
    result: 'Longueur cranio-caudale : 5,9 cm. Clarté nucale : 1,2 mm. Normal.',
    labName: "Centre d'imagerie Paris 15",
    isCompleted: true, phase: 'pregnancy',
    createdAt: s(80) + 'T10:00:00Z',
  },
  {
    id: 'ex-002', type: 'Prise de sang — Bilan T1',
    scheduledDate: s(65), completedDate: s(65),
    result: 'Groupe ABO : A+. Sérologies négatives. NFS normale.',
    labName: 'Laboratoire BioMédical',
    isCompleted: true, phase: 'pregnancy',
    createdAt: s(70) + 'T10:00:00Z',
  },
  {
    id: 'ex-003', type: 'Dépistage trisomie 21',
    scheduledDate: s(62), completedDate: s(62),
    result: 'Risque faible : 1/4500. Pas d\'investigation complémentaire nécessaire.',
    isCompleted: true, phase: 'pregnancy',
    createdAt: s(65) + 'T10:00:00Z',
  },
  {
    id: 'ex-004', type: 'Prise de sang — Bilan T2',
    scheduledDate: s(4), completedDate: s(4),
    result: 'NFS : légère anémie ferriprive. Ferritine 12 µg/L. Supplémentation recommandée.',
    labName: 'Laboratoire BioAnalyse Montparnasse',
    isCompleted: true, phase: 'pregnancy',
    createdAt: s(10) + 'T10:00:00Z',
  },
  {
    id: 'ex-005', type: 'Échographie morphologique T2',
    scheduledDate: d(6),
    result: undefined,
    labName: 'Cabinet Dr Fontaine',
    doctorName: 'Dr Marie Fontaine',
    isCompleted: false, phase: 'pregnancy',
    createdAt: s(14) + 'T10:00:00Z',
  },
  {
    id: 'ex-006', type: 'Test HGPO (diabète gestationnel)',
    scheduledDate: d(22),
    isCompleted: false, phase: 'pregnancy',
    createdAt: s(5) + 'T10:00:00Z',
  },
];

// ─── JOURNAL ──────────────────────────────────────────────────

export const MOCK_JOURNAL: PregnancyJournalEntry[] = [
  {
    id: 'jrn-001', date: s(1), week: 22,
    content: "J'ai senti bébé bouger pour la première fois ce matin — un tout petit coup discret dans le bas du ventre. J'ai pleuré de joie ! Je n'oublierai jamais ce moment. Mon compagnon a mis sa main sur mon ventre toute la soirée en espérant sentir quelque chose, sans succès… mais son sourire valait tout l'or du monde.",
    mood: 5, tags: ['Mouvements bébé 👋', 'Émotion 💭'],
    createdAt: s(1) + 'T21:30:00Z',
  },
  {
    id: 'jrn-002', date: s(6), week: 21,
    content: "Semaine difficile avec beaucoup de fatigue. J'ai du mal à trouver une position confortable pour dormir. Le coussin de grossesse aide un peu mais pas autant qu'espéré. Mon médecin dit que c'est tout à fait normal à ce stade, que le corps s'adapte. J'essaie de rester positive.",
    mood: 3, tags: ['Émotion 💭'],
    createdAt: s(6) + 'T20:00:00Z',
  },
  {
    id: 'jrn-003', date: s(13), week: 20,
    content: "Échographie de la mi-grossesse repoussée d'une semaine — un peu déçue mais ça va. On a profité du weekend pour commencer à réfléchir à la chambre de bébé. On a visité deux magasins et on a craqué pour un lit à barreaux blanc et un tapis étoilé. C'est devenu très concret.",
    mood: 4, tags: ['Achats 🛍️', 'Famille 👨‍👩‍👧'],
    createdAt: s(13) + 'T19:00:00Z',
  },
  {
    id: 'jrn-004', date: s(20), week: 19,
    content: "Première séance de préparation à l'accouchement aujourd'hui. J'étais stressée à l'idée d'y aller seule — mon compagnon travaille — mais l'ambiance était très douce. La sage-femme est bienveillante. On a beaucoup parlé de respiration. Je me sens moins effrayée.",
    mood: 4, tags: ['Prépas 🏥'],
    createdAt: s(20) + 'T18:00:00Z',
  },
];

// ─── WEIGHT ENTRIES ──────────────────────────────────────────

export const MOCK_WEIGHT_ENTRIES: WeightEntry[] = [
  { id: 'w-001', date: s(95), weightKg: 61.5, phase: 'pregnancy', createdAt: s(95) + 'T09:00:00Z' },
  { id: 'w-002', date: s(81), weightKg: 61.9, notes: 'Semaine 15', phase: 'pregnancy', createdAt: s(81) + 'T09:00:00Z' },
  { id: 'w-003', date: s(67), weightKg: 62.8, notes: 'Semaine 17', phase: 'pregnancy', createdAt: s(67) + 'T09:00:00Z' },
  { id: 'w-004', date: s(53), weightKg: 63.7, phase: 'pregnancy', createdAt: s(53) + 'T09:00:00Z' },
  { id: 'w-005', date: s(39), weightKg: 64.9, phase: 'pregnancy', createdAt: s(39) + 'T09:00:00Z' },
  { id: 'w-006', date: s(25), weightKg: 65.8, phase: 'pregnancy', createdAt: s(25) + 'T09:00:00Z' },
  { id: 'w-007', date: s(11), weightKg: 66.7, notes: '+5,2 kg depuis le début', phase: 'pregnancy', createdAt: s(11) + 'T09:00:00Z' },
  { id: 'w-008', date: s(3),  weightKg: 67.1, phase: 'pregnancy', createdAt: s(3)  + 'T09:00:00Z' },
];

// ─── CHECKLIST OVERRIDES ─────────────────────────────────────
// Items already completed at SA 22

export const MOCK_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'cl-001', label: 'Prendre de l\'acide folique quotidiennement',       category: 'medical',     weekFrom: 4,  weekTo: 12, isRequired: true,  isDone: true,  completedAt: s(80) + 'T10:00:00Z' },
  { id: 'cl-002', label: 'Consulter un médecin / sage-femme pour confirmation', category: 'medical',   weekFrom: 5,  weekTo: 8,  isRequired: true,  isDone: true,  completedAt: s(90) + 'T10:00:00Z' },
  { id: 'cl-003', label: 'Faire la prise de sang du 1er trimestre',           category: 'medical',     weekFrom: 8,  weekTo: 12, isRequired: true,  isDone: true,  completedAt: s(65) + 'T10:00:00Z' },
  { id: 'cl-004', label: 'Déclarer la grossesse à la CAF / Sécurité Sociale', category: 'admin',       weekFrom: 8,  weekTo: 14, isRequired: true,  isDone: true,  completedAt: s(70) + 'T10:00:00Z' },
  { id: 'cl-005', label: 'Échographie T1 (11–13 SA)',                          category: 'medical',     weekFrom: 11, weekTo: 13, isRequired: true,  isDone: true,  completedAt: s(70) + 'T10:00:00Z' },
  { id: 'cl-006', label: 'Informer l\'employeur (congé maternité)',            category: 'admin',       weekFrom: 10, weekTo: 16, isRequired: true,  isDone: true,  completedAt: s(55) + 'T10:00:00Z' },
  { id: 'cl-007', label: 'Commencer la supplémentation en vitamine D',         category: 'medical',     weekFrom: 12, weekTo: 40, isRequired: false, isDone: true,  completedAt: s(60) + 'T10:00:00Z' },
  { id: 'cl-008', label: 'Arrêter alcool, tabac et médicaments non prescrits', category: 'medical',    weekFrom: 4,  weekTo: 40, isRequired: true,  isDone: true,  completedAt: s(95) + 'T10:00:00Z' },
  { id: 'cl-009', label: 'Choisir la maternité et visiter si possible',        category: 'preparation', weekFrom: 14, weekTo: 24, isRequired: true,  isDone: true,  completedAt: s(45) + 'T10:00:00Z' },
  { id: 'cl-010', label: 'Prise de sang du 2ème trimestre',                   category: 'medical',     weekFrom: 18, weekTo: 22, isRequired: true,  isDone: true,  completedAt: s(4)  + 'T10:00:00Z' },
  { id: 'cl-011', label: 'Échographie morphologique T2',                       category: 'medical',     weekFrom: 20, weekTo: 24, isRequired: true,  isDone: false },
  { id: 'cl-012', label: 'Dépistage diabète gestationnel (HGPO)',              category: 'medical',     weekFrom: 24, weekTo: 28, isRequired: false, isDone: false },
  { id: 'cl-013', label: 'Commencer les cours de préparation à la naissance',  category: 'preparation', weekFrom: 20, weekTo: 30, isRequired: false, isDone: true,  completedAt: s(20) + 'T10:00:00Z' },
  { id: 'cl-014', label: 'Rédiger le projet de naissance',                    category: 'preparation', weekFrom: 22, weekTo: 32, isRequired: false, isDone: false },
  { id: 'cl-015', label: 'Choisir un pédiatre',                               category: 'preparation', weekFrom: 20, weekTo: 32, isRequired: false, isDone: false },
  { id: 'cl-016', label: 'Prévenir la mutuelle (déclaration grossesse)',       category: 'admin',       weekFrom: 14, weekTo: 20, isRequired: false, isDone: true,  completedAt: s(50) + 'T10:00:00Z' },
];
