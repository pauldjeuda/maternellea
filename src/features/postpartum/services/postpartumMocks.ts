/**
 * features/postpartum/services/postpartumMocks.ts
 * All mock data for postpartum + baby modules. Dates computed from today.
 */

import { subDays, format } from 'date-fns';
import type { PostpartumEntry } from '@types/models';
import type { HealthNote } from '../types';

const today = new Date();
const s = (n: number) => format(subDays(today, n), 'yyyy-MM-dd');

// ─── POSTPARTUM ENTRIES (14 days of tracking) ─────────────────

export const MOCK_POSTPARTUM_FULL: PostpartumEntry[] = [
  {
    id: 'pp-001', date: s(13), mood: 2, fatigue: 5, pain: 3,
    symptoms: ['perineal_pain', 'fatigue', 'baby_blues'],
    isBreastfeeding: true,
    notes: 'Première semaine difficile. Beaucoup de pleurs. Mon compagnon est très présent, ça aide.',
    createdAt: s(13) + 'T22:00:00Z',
  },
  {
    id: 'pp-002', date: s(11), mood: 3, fatigue: 4, pain: 2,
    symptoms: ['fatigue', 'breast_engorgement'],
    isBreastfeeding: true,
    notes: "Engorgement douloureux. Consultée la sage-femme, elle m'a aidée avec la position d'allaitement.",
    createdAt: s(11) + 'T21:30:00Z',
  },
  {
    id: 'pp-003', date: s(9), mood: 3, fatigue: 4, pain: 1,
    symptoms: ['fatigue', 'insomnia'],
    isBreastfeeding: true,
    createdAt: s(9) + 'T21:00:00Z',
  },
  {
    id: 'pp-004', date: s(7), mood: 4, fatigue: 3, pain: 1,
    symptoms: ['fatigue'],
    isBreastfeeding: true,
    notes: "Un peu mieux aujourd'hui. Bébé a dormi 3h d'affilée la nuit !",
    createdAt: s(7) + 'T20:30:00Z',
  },
  {
    id: 'pp-005', date: s(5), mood: 3, fatigue: 4, pain: 0,
    symptoms: ['hair_loss', 'fatigue'],
    isBreastfeeding: true,
    notes: "Beaucoup de chute de cheveux, c'est stressant. J'ai lu que c'est normal jusqu'à 6 mois.",
    createdAt: s(5) + 'T21:00:00Z',
  },
  {
    id: 'pp-006', date: s(3), mood: 4, fatigue: 3, pain: 0,
    symptoms: ['fatigue'],
    isBreastfeeding: true,
    notes: "Nuit correcte. Léa commence à sourire, ça efface toute la fatigue !",
    createdAt: s(3) + 'T21:30:00Z',
  },
  {
    id: 'pp-007', date: s(1), mood: 4, fatigue: 3, pain: 0,
    symptoms: ['fatigue'],
    isBreastfeeding: true,
    notes: '3 réveils la nuit. Fatiguée mais ça va.',
    createdAt: s(1) + 'T22:00:00Z',
  },
];

// ─── HEALTH NOTES ──────────────────────────────────────────────

export const MOCK_HEALTH_NOTES: HealthNote[] = [
  {
    id: 'hn-001', babyId: 'baby-001',
    date: s(10), category: 'milestone',
    content: 'Premier sourire social aujourd\'hui à 12 semaines ! Elle a souri en réponse à ma voix. Je n\'oublierai jamais ce moment.',
    createdAt: s(10) + 'T18:00:00Z',
  },
  {
    id: 'hn-002', babyId: 'baby-001',
    date: s(8), category: 'doctor_visit',
    content: 'Visite chez Dr Vidal. Tout est normal. Poids : 6,02 kg (+680g depuis le mois dernier). Vaccins Hexavalent et Pneumocoque faits. Légère réaction au point d\'injection.',
    createdAt: s(8) + 'T12:00:00Z',
  },
  {
    id: 'hn-003', babyId: 'baby-001',
    date: s(6), category: 'feeding',
    content: "Passage aux tétées toutes les 3h au lieu de 2h. Léa semble plus satisfaite. L'allaitement se passe bien, elle a pris le rythme.",
    createdAt: s(6) + 'T14:00:00Z',
  },
  {
    id: 'hn-004', babyId: 'baby-001',
    date: s(4), category: 'sleep',
    content: "Premier cycle de sommeil de 4h consécutives la nuit ! De 22h à 2h. Enfin un peu de repos. On continue la routine du soir : bain, biberon, berceuse.",
    createdAt: s(4) + 'T09:00:00Z',
  },
  {
    id: 'hn-005', babyId: 'baby-001',
    date: s(2), category: 'milestone',
    content: "Elle suit un objet des yeux sur presque 180° maintenant. Le mobile au-dessus du berceau la fascine. Tient bien sa tête en position ventrale.",
    createdAt: s(2) + 'T16:00:00Z',
  },
  {
    id: 'hn-006', babyId: 'baby-001',
    date: s(1), category: 'symptom',
    content: "Léger écoulement nasal sans fièvre. Nez bouché depuis hier soir. Mouché délicatement avec le mouche-bébé. Surveille l'évolution.",
    createdAt: s(1) + 'T19:00:00Z',
  },
];
