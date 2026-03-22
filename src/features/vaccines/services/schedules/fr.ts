/**
 * features/vaccines/services/schedules/fr.ts
 *
 * French national vaccine schedule (Programme National d'Immunisation).
 * Reference: Calendrier vaccinal Santé Publique France.
 *
 * To add another country:
 *   1. Create `features/vaccines/services/schedules/cm.ts` (Cameroun, etc.)
 *   2. Export a VaccineScheduleProvider with the same interface
 *   3. Register it in scheduleRegistry.ts
 */

import type { VaccineScheduleProvider, VaccineDefinition } from '../../types';

const def = (
  id: string,
  shortName: string,
  name: string,
  series: string,
  dose: number,
  totalDoses: number,
  ageMonths: number,
  ageLabel: string,
  minAge: number,
  maxAge: number,
  diseases: string[],
  mandatory: boolean,
  notes?: string,
): VaccineDefinition => ({
  id,
  name,
  shortName,
  description: `Protège contre : ${diseases.join(', ')}.`,
  diseases,
  recommendedAgeMonths: ageMonths,
  recommendedAgeLabel:  ageLabel,
  numberOfDoses:        totalDoses,
  doseNumber:           dose,
  seriesName:           series,
  isMandatory:          mandatory,
  isRecommended:        true,
  isOptional:           !mandatory,
  minAgeMonths:         minAge,
  maxAgeMonths:         maxAge,
  allowsCatchUp:        true,
  notes,
});

export const FR_SCHEDULE: VaccineScheduleProvider = {
  countryCode:  'FR',
  countryName:  'France',
  scheduleYear: 2024,
  sourceUrl:    'https://www.santepubliquefrance.fr/maladies-et-traumatismes/maladies-a-prevention-vaccinale/calendrier-vaccinal',

  definitions: [
    // BCG
    def('bcg', 'BCG', 'BCG', 'BCG', 1, 1, 0, 'Naissance', 0, 2, ['Tuberculose'], false,
      "Recommandé en Île-de-France, Guyane, et pour les enfants à risque élevé."),

    // Hépatite B
    def('hepb-1', 'HepB 1', 'Hépatite B — dose 1', 'Hépatite B', 1, 3, 0, 'Naissance', 0, 1,
      ['Hépatite B'], false, "Pour les nouveau-nés de mères AgHBs+."),

    // Hexavalent (DTPc + Hib + HepB)
    def('hexa-1', 'Hexa 1', 'Hexavalent — dose 1', 'Hexavalent', 1, 3, 2, '2 mois', 2, 3,
      ['Diphtérie', 'Tétanos', 'Poliomyélite', 'Coqueluche', 'Hib', 'Hépatite B'], true),
    def('hexa-2', 'Hexa 2', 'Hexavalent — dose 2', 'Hexavalent', 2, 3, 4, '4 mois', 4, 5,
      ['Diphtérie', 'Tétanos', 'Poliomyélite', 'Coqueluche', 'Hib', 'Hépatite B'], true),
    def('hexa-3', 'Hexa 3', 'Hexavalent — dose 3', 'Hexavalent', 3, 3, 11, '11 mois', 11, 15,
      ['Diphtérie', 'Tétanos', 'Poliomyélite', 'Coqueluche', 'Hib', 'Hépatite B'], true),

    // Pneumocoque
    def('pneumo-1', 'Pneumo 1', 'Pneumocoque — dose 1', 'Pneumocoque', 1, 3, 2, '2 mois', 2, 3,
      ['Infections à pneumocoque'], true),
    def('pneumo-2', 'Pneumo 2', 'Pneumocoque — dose 2', 'Pneumocoque', 2, 3, 4, '4 mois', 4, 5,
      ['Infections à pneumocoque'], true),
    def('pneumo-3', 'Pneumo 3', 'Pneumocoque — dose 3', 'Pneumocoque', 3, 3, 11, '11 mois', 11, 15,
      ['Infections à pneumocoque'], true),

    // Méningocoque B
    def('menb-1', 'MenB 1', 'Méningocoque B — dose 1', 'Méningocoque B', 1, 3, 3, '3 mois', 2, 4,
      ['Méningite à méningocoque B'], false),
    def('menb-2', 'MenB 2', 'Méningocoque B — dose 2', 'Méningocoque B', 2, 3, 5, '5 mois', 4, 7,
      ['Méningite à méningocoque B'], false),
    def('menb-3', 'MenB 3', 'Méningocoque B — dose 3', 'Méningocoque B', 3, 3, 12, '12 mois', 12, 18,
      ['Méningite à méningocoque B'], false),

    // Méningocoque C
    def('menc', 'MenC', 'Méningocoque C', 'Méningocoque C', 1, 1, 5, '5 mois', 5, 24,
      ['Méningite à méningocoque C'], true),

    // ROR (rougeole, oreillons, rubéole)
    def('ror-1', 'ROR 1', 'ROR — dose 1', 'ROR', 1, 2, 12, '12 mois', 11, 15,
      ['Rougeole', 'Oreillons', 'Rubéole'], true),
    def('ror-2', 'ROR 2', 'ROR — dose 2', 'ROR', 2, 2, 16, '16–18 mois', 16, 24,
      ['Rougeole', 'Oreillons', 'Rubéole'], true),

    // Varicelle
    def('var-1', 'Var 1', 'Varicelle — dose 1', 'Varicelle', 1, 2, 12, '12 mois', 11, 18,
      ['Varicelle'], false),
    def('var-2', 'Var 2', 'Varicelle — dose 2', 'Varicelle', 2, 2, 18, '18 mois', 18, 24,
      ['Varicelle'], false),

    // DTP rappel 6 ans
    def('dtp-6a', 'dTcaP 6a', 'DTP + Coqueluche — rappel 6 ans', 'DTP', 1, 1, 72, '6 ans', 72, 96,
      ['Diphtérie', 'Tétanos', 'Poliomyélite', 'Coqueluche'], true),

    // HPV
    def('hpv-1', 'HPV 1', 'HPV — dose 1', 'HPV', 1, 2, 132, '11–14 ans', 132, 168,
      ['Papillomavirus humain (HPV)'], true,
      "Recommandé à 11 ans pour les filles et garçons. 2 doses si primo-vaccination avant 15 ans."),
    def('hpv-2', 'HPV 2', 'HPV — dose 2', 'HPV', 2, 2, 138, '11–14 ans (6 mois après dose 1)', 138, 174,
      ['Papillomavirus humain (HPV)'], true),
  ],
};
