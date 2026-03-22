/**
 * features/pregnancy/utils/pregnancyCalc.ts
 *
 * Pure calculation and data functions.
 * No side effects, no imports from stores or React.
 */

import {
  parseISO, addDays, differenceInDays, differenceInWeeks,
  format, isBefore, isAfter,
} from 'date-fns';
import { PREGNANCY, TRIMESTER_LABELS } from '@constants';
import { tokens } from '@theme/tokens';
import type { PregnancyProfile, WeeklyContent, WeightEntry } from '@types/models';
import type { ChecklistItem, PregnancyProgress, WeightGain } from '../types';

const { colors } = tokens;

// ─────────────────────────────────────────────────────────────
//  ID GENERATOR
// ─────────────────────────────────────────────────────────────

export function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─────────────────────────────────────────────────────────────
//  PREGNANCY PROGRESS
// ─────────────────────────────────────────────────────────────

export function computeProgress(pregnancy: PregnancyProfile): PregnancyProgress {
  const trimesterColor =
    pregnancy.trimester === 1 ? colors.fertile :
    pregnancy.trimester === 2 ? colors.phasePregnancy :
    colors.phaseCycle;

  const daysLeft  = Math.max(0, differenceInDays(parseISO(pregnancy.dueDate), new Date()));
  const weeksLeft = Math.floor(daysLeft / 7);
  const totalDays = differenceInDays(new Date(), parseISO(pregnancy.lmpDate));
  const pct       = Math.min(100, Math.round((totalDays / PREGNANCY.DAYS) * 100));

  return {
    week:           pregnancy.currentWeek,
    day:            pregnancy.currentDay,
    trimester:      pregnancy.trimester,
    pct,
    daysLeft,
    weeksLeft,
    dueDate:        pregnancy.dueDate,
    isTerminated:   pregnancy.currentWeek > PREGNANCY.TOTAL_WEEKS,
    trimesterLabel: TRIMESTER_LABELS[pregnancy.trimester]!,
    trimesterColor,
  };
}

// ─────────────────────────────────────────────────────────────
//  WEIGHT GAIN ANALYSIS
// ─────────────────────────────────────────────────────────────

export function computeWeightGain(entries: WeightEntry[]): WeightGain {
  const sorted = [...entries]
    .filter(e => e.phase === 'pregnancy')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length === 0) {
    return { current: 0, entries: [], trend: 'stable' };
  }

  const first   = sorted[0]!.weightKg;
  const last    = sorted[sorted.length - 1]!.weightKg;
  const current = parseFloat((last - first).toFixed(1));

  // Trend: compare last 2 entries
  let trend: WeightGain['trend'] = 'stable';
  if (sorted.length >= 2) {
    const prev = sorted[sorted.length - 2]!.weightKg;
    const diff = last - prev;
    if (diff > 0.2)  trend = 'gaining';
    if (diff < -0.2) trend = 'losing';
  }

  return {
    current,
    startWeight: first,
    entries: sorted.map(e => ({ date: e.date, kg: e.weightKg })),
    trend,
  };
}

// ─────────────────────────────────────────────────────────────
//  WEEK CONTENT DATABASE  (SA 4–40)
// ─────────────────────────────────────────────────────────────

const WEEKLY_DB: Record<number, WeeklyContent> = {
  4:  { week: 4,  emoji: '🌱', babySize: 'un grain de pavot',         babySizeCm: 0.2,  babyWeightGrams: 0,   babyDevelopment: "L'embryon vient de s'implanter. Le tube neural commence à se former — base du cerveau et de la colonne vertébrale.", motherChanges: "Vous ne savez peut-être pas encore que vous êtes enceinte. La fatigue et de légères nausées peuvent apparaître.", nutritionTip: "Assurez-vous d'avoir un apport suffisant en acide folique (400 µg/j) — crucial pour le système nerveux de bébé." },
  5:  { week: 5,  emoji: '🫛', babySize: 'une graine de sésame',       babySizeCm: 0.4,  babyWeightGrams: 0,   babyDevelopment: "Le cœur commence à battre — environ 100 bpm. Les premières ébauches des bras et des jambes apparaissent.", motherChanges: "Les nausées matinales peuvent débuter. Votre poitrine peut être plus sensible.", nutritionTip: "Fractionnez vos repas en petites quantités pour limiter les nausées. Le gingembre peut aider." },
  6:  { week: 6,  emoji: '🫘', babySize: 'une lentille',               babySizeCm: 0.6,  babyWeightGrams: 0,   babyDevelopment: "Le cœur bat à 110 bpm. Les yeux, narines et oreilles commencent à se former.", motherChanges: "Fatigue intense possible. Fréquence urinaire accrue.", nutritionTip: "Hydratez-vous régulièrement. Évitez la caféine (max 200 mg/j)." },
  7:  { week: 7,  emoji: '🫐', babySize: 'un myrtille',                babySizeCm: 1.2,  babyWeightGrams: 1,   babyDevelopment: "Les membres se développent rapidement. Le cerveau forme environ 100 nouvelles cellules par minute.", motherChanges: "Le ventre reste encore invisible mais l'utérus a doublé de taille.", nutritionTip: "Consommez des aliments riches en B6 (banane, volaille) pour atténuer les nausées." },
  8:  { week: 8,  emoji: '🍓', babySize: 'une framboise',              babySizeCm: 1.6,  babyWeightGrams: 1,   babyDevelopment: "Tous les organes principaux sont en place. Le fœtus commence à bouger, même si vous ne le sentez pas encore.", motherChanges: "Les nausées sont souvent au maximum. Prenez soin de vous.", nutritionTip: "Consommez des protéines à chaque repas pour soutenir la croissance cellulaire rapide." },
  9:  { week: 9,  emoji: '🫒', babySize: 'une olive',                  babySizeCm: 2.3,  babyWeightGrams: 2,   babyDevelopment: "Les muscles commencent à se former. Le cœur a désormais 4 cavités.", motherChanges: "Constipation fréquente. Continuez la prise d'acide folique.", nutritionTip: "Augmentez les fibres (fruits, légumes, céréales complètes) pour lutter contre la constipation." },
  10: { week: 10, emoji: '🫑', babySize: 'une prune',                  babySizeCm: 3.2,  babyWeightGrams: 4,   babyDevelopment: "La phase embryonnaire se termine, c'est maintenant un fœtus. Les ongles commencent à pousser.", motherChanges: "Les nausées peuvent commencer à s'atténuer. Votre énergie revient progressivement.", nutritionTip: "Commencez à augmenter vos apports en calcium : laitages, sardines, brocoli." },
  11: { week: 11, emoji: '🫒', babySize: 'un citron vert',             babySizeCm: 4.1,  babyWeightGrams: 7,   babyDevelopment: "Le fœtus avale du liquide amniotique. Ses réflexes primitifs apparaissent.", motherChanges: "Le ventre commence légèrement à se voir. Votre nausée devrait s'améliorer.", nutritionTip: "Le zinc est crucial maintenant : noix, graines de courge, légumineuses.", checkupNote: "Prévoyez l'échographie T1 (11–13 SA) et la prise de sang de dépistage." },
  12: { week: 12, emoji: '🍋', babySize: 'un citron',                  babySizeCm: 5.4,  babyWeightGrams: 14,  babyDevelopment: "Les organes génitaux se différencient. Les réflexes sont plus nets. Le placenta assume ses fonctions.", motherChanges: "Fin du 1er trimestre ! Le risque de fausse couche chute significativement.", nutritionTip: "Vous pouvez commencer à annoncer votre grossesse ! Et augmenter progressivement vos calories (+300 kcal/j).", checkupNote: "Échographie T1 : longueur cranio-caudale, clarté nucale, marqueurs chromosomiques." },
  13: { week: 13, emoji: '🍑', babySize: 'une pêche',                  babySizeCm: 7.4,  babyWeightGrams: 23,  babyDevelopment: "Vos empreintes digitales sont définitivement formées. Il peut téter son pouce !", motherChanges: "2ème trimestre ! Énergie retrouvée pour beaucoup. Le ventre commence à arrondir.", nutritionTip: "Continuez la supplémentation en acide folique et ajoutez de la vitamine D (400–1000 UI/j)." },
  14: { week: 14, emoji: '🍊', babySize: 'une orange',                 babySizeCm: 8.7,  babyWeightGrams: 43,  babyDevelopment: "Le fœtus fait des grimaces et des mouvements de succion. Ses sourcils se forment.", motherChanges: "L'énergie revient ! C'est souvent la période la plus agréable de la grossesse.", nutritionTip: "Omega-3 essentiels pour le cerveau de bébé : sardines, maquereaux, noix de Grenoble." },
  15: { week: 15, emoji: '🍎', babySize: 'une pomme',                  babySizeCm: 10.1, babyWeightGrams: 70,  babyDevelopment: "Il peut percevoir la lumière. Ses os se renforcent grâce au calcium.", motherChanges: "Vous pouvez commencer à sentir les premiers mouvements (papillonnements).", nutritionTip: "Apport en fer accru : viandes, légumineuses avec vitamine C pour l'absorption." },
  16: { week: 16, emoji: '🥑', babySize: 'un avocat',                  babySizeCm: 11.6, babyWeightGrams: 100, babyDevelopment: "Il entend ! Parlez-lui, chantez. Ses yeux bougent sous les paupières.", motherChanges: "Le ventre est visible pour tous. Votre centre de gravité change.", nutritionTip: "Fer, fer, fer ! Légumineuses, viandes maigres, épinards — associez avec du citron." },
  17: { week: 17, emoji: '🍐', babySize: 'une poire',                  babySizeCm: 13.0, babyWeightGrams: 140, babyDevelopment: "La graisse sous-cutanée commence à se former pour réguler la température.", motherChanges: "Douleurs ligamentaires dans l'aine fréquentes. Normal — les ligaments s'étirent.", nutritionTip: "Magnésium pour les crampes : amandes, épinards, chocolat noir." },
  18: { week: 18, emoji: '🥦', babySize: 'une patate douce',           babySizeCm: 14.2, babyWeightGrams: 190, babyDevelopment: "Les empreintes digitales sont complètes. Il entend clairement vos sons.", motherChanges: "Mouvements de plus en plus perceptibles. Fond utérin à mi-chemin nombril-pubis.", nutritionTip: "Calcium : 1000 mg/j. Laitage, sardines avec arêtes, tofu.", checkupNote: "Préparez l'échographie morphologique T2 (20–24 SA)." },
  19: { week: 19, emoji: '🥭', babySize: 'une mangue',                 babySizeCm: 15.3, babyWeightGrams: 240, babyDevelopment: "Le vernix (enduit blanc protecteur) recouvre sa peau. Développement cérébral intense.", motherChanges: "Douleurs ligamentaires plus fréquentes. Dormez sur le côté gauche si possible.", nutritionTip: "Oméga-3 : poissons gras (2×/sem), huile de colza, noix." },
  20: { week: 20, emoji: '🌽', babySize: 'un épi de maïs',             babySizeCm: 16.4, babyWeightGrams: 300, babyDevelopment: "Mi-grossesse ! Il ouvre ses yeux. Son ouïe est pleinement développée.", motherChanges: "Le fond utérin atteint le nombril. Les mouvements sont bien ressentis.", nutritionTip: "Vitamine B9 (folates) toujours importants : légumes verts à feuilles.", checkupNote: "Échographie morphologique T2 — moment clé !" },
  21: { week: 21, emoji: '🥕', babySize: 'une carotte',                babySizeCm: 26.7, babyWeightGrams: 360, babyDevelopment: "Il développe ses habitudes de sommeil. Ses sourcils sont bien formés.", motherChanges: "Brûlures d'estomac possibles. Fractionnez les repas.", nutritionTip: "Hydratation : 1,5 à 2L d'eau par jour — prévient crampes et infections urinaires." },
  22: { week: 22, emoji: '🌽', babySize: 'un épi de maïs',             babySizeCm: 27.8, babyWeightGrams: 430, babyDevelopment: "Il perçoit les sons extérieurs et peut sursauter. Ses empreintes digitales sont pleinement formées.", motherChanges: "Fond utérin au niveau du nombril. Mouvements réguliers ressentis.", nutritionTip: "Fer + vitamine C pour l'absorption. Lentilles, épinards, poivron rouge.", checkupNote: "Consultation mensuelle + prise de sang du 2ème trimestre." },
  24: { week: 24, emoji: '🌽', babySize: 'un épi de maïs mûr',        babySizeCm: 30.0, babyWeightGrams: 600, babyDevelopment: "Ses poumons commencent à mûrir. Il réagit aux sons forts.", motherChanges: "Éventuelles varices et jambes lourdes. Surélevez vos jambes le soir.", nutritionTip: "Continuez le calcium et les oméga-3. Réduisez le sel pour les œdèmes.", warningSign: "Consultez si vous ressentez des contractions régulières avant 37 SA.", checkupNote: "Rédigez votre projet de naissance !" },
  26: { week: 26, emoji: '🥒', babySize: 'un concombre',               babySizeCm: 35.6, babyWeightGrams: 760, babyDevelopment: "Ses yeux s'ouvrent ! Il inhale et exhale du liquide amniotique pour préparer ses poumons.", motherChanges: "Fin du 2ème trimestre approche. Œdèmes aux chevilles fréquents.", nutritionTip: "Vitamine C pour l'immunité. Kiwis, poivrons, agrumes.", checkupNote: "Dépistage diabète gestationnel (HGPO) recommandé entre 24–28 SA." },
  28: { week: 28, emoji: '🍆', babySize: 'une aubergine',              babySizeCm: 37.6, babyWeightGrams: 1005, babyDevelopment: "3ème trimestre ! Il rêve (stade REM). Son cerveau connaît une croissance rapide.", motherChanges: "Ventre très visible. Possible essoufflement. Dormez sur le côté gauche.", nutritionTip: "DHA (oméga-3) essentiels pour le cerveau : saumon, maquereau, thon en conserve.", checkupNote: "Consultation 7ème mois + début des préparations à l'accouchement." },
  30: { week: 30, emoji: '🥥', babySize: 'une noix de coco',           babySizeCm: 39.9, babyWeightGrams: 1300, babyDevelopment: "Il se retourne et se positionne. Sa vue se développe bien qu'encore limitée.", motherChanges: "Fatigue de retour. Possible insomnie et jambes sans repos.", nutritionTip: "Magnésium pour les crampes nocturnes : amandes, noix de cajou." },
  32: { week: 32, emoji: '🥦', babySize: 'une tête de brocoli',        babySizeCm: 42.4, babyWeightGrams: 1700, babyDevelopment: "Ses ongles et cheveux sont bien formés. Il s'entraîne à respirer.", motherChanges: "Braxton-Hicks (contractions d'entraînement) plus fréquentes.", nutritionTip: "Fer et vitamine C. Préparez vos réserves pour l'accouchement.", checkupNote: "Préparez le sac de maternité !" },
  34: { week: 34, emoji: '🍀', babySize: 'une courge butternut',       babySizeCm: 45.0, babyWeightGrams: 2100, babyDevelopment: "Ses poumons sont presque maturés. Son système immunitaire se renforce.", motherChanges: "Essoufflement maximal avec l'utérus qui monte. Descente possible bientôt.", nutritionTip: "Continuez une alimentation équilibrée. Évitez les grands repas le soir.", checkupNote: "Installez le siège auto. Préparez la chambre de bébé.", checkupNote: "Consultation anesthésiste si vous souhaitez une péridurale." },
  36: { week: 36, emoji: '🥬', babySize: 'une laitue romaine',         babySizeCm: 47.4, babyWeightGrams: 2600, babyDevelopment: "Il est en position tête en bas dans la plupart des cas. Presque à terme !", motherChanges: "Souffle peut revenir si bébé descend. Fatigue et impatience.", nutritionTip: "Dattier : des études suggèrent que manger des dattes en fin de grossesse facilite l'accouchement.", checkupNote: "Prélèvement streptocoque B (35–37 SA). Visite de la maternité si pas encore fait." },
  37: { week: 37, emoji: '🌺', babySize: 'une courge spaghetti',       babySizeCm: 48.6, babyWeightGrams: 2900, babyDevelopment: "À terme précoce ! Tous les organes sont prêts. Il prend de la graisse chaque jour.", motherChanges: "Contractions d'entraînement plus fréquentes. Perte du bouchon muqueux possible.", nutritionTip: "Restez hydratée et mangez légèrement. Marchez pour encourager la descente.", checkupNote: "Consultation hebdomadaire possible selon votre suivi." },
  38: { week: 38, emoji: '🎃', babySize: 'une citrouille',             babySizeCm: 49.8, babyWeightGrams: 3100, babyDevelopment: "Il se prépare à naître. Ses poumons produisent du surfactant.", motherChanges: "Vous pouvez sentir la descente de bébé. Contractions irrégulières.", nutritionTip: "Restez à l'écoute de votre corps. Reposez-vous.", warningSign: "Contractions régulières ≤ 5 min → maternité ! Perte des eaux → maternité !" },
  39: { week: 39, emoji: '🍉', babySize: 'une pastèque',               babySizeCm: 50.7, babyWeightGrams: 3300, babyDevelopment: "Bébé est prêt ! La majorité des bébés naissent entre 38 et 41 SA.", motherChanges: "Tout peut se déclencher à tout moment. Restez zen et prête.", nutritionTip: "Mangez légèrement, buvez régulièrement. Restez active mais reposez-vous.", warningSign: "Pas de mouvements pendant plus de 2h → appelez la maternité." },
  40: { week: 40, emoji: '🌟', babySize: 'une pastèque bien mûre',     babySizeCm: 51.2, babyWeightGrams: 3400, babyDevelopment: "Terme ! Bébé est prêt à venir au monde. Chaque jour renforce ses poumons.", motherChanges: "La date prévue est arrivée. Soyez patiente — 50% des bébés naissent après le terme.", nutritionTip: "Restez active : marche, montées d'escaliers peuvent aider le déclenchement naturel.", warningSign: "Après 41 SA, un déclenchement peut être proposé par votre équipe médicale." },
};

export function getWeeklyContent(week: number): WeeklyContent {
  // Return exact week if available, otherwise nearest week below
  for (let w = week; w >= 4; w--) {
    if (WEEKLY_DB[w]) return WEEKLY_DB[w]!;
  }
  return WEEKLY_DB[4]!;
}

export function getWeeksRange(): number[] {
  return Array.from({ length: 37 }, (_, i) => i + 4); // 4–40
}

// ─────────────────────────────────────────────────────────────
//  COMPREHENSIVE CHECKLIST  (all 40 weeks)
// ─────────────────────────────────────────────────────────────

export const MASTER_CHECKLIST: Omit<ChecklistItem, 'isDone' | 'completedAt'>[] = [
  // ── T1 ──────────────────────────────────────────────────────
  { id: 'cl-001', label: 'Prendre de l\'acide folique quotidiennement',      category: 'medical',      weekFrom: 4,  weekTo: 12, isRequired: true  },
  { id: 'cl-002', label: 'Consulter un médecin / sage-femme pour confirmation', category: 'medical',   weekFrom: 5,  weekTo: 8,  isRequired: true  },
  { id: 'cl-003', label: 'Faire la prise de sang du 1er trimestre',          category: 'medical',      weekFrom: 8,  weekTo: 12, isRequired: true  },
  { id: 'cl-004', label: 'Déclarer la grossesse à la CAF / Sécurité Sociale', category: 'admin',       weekFrom: 8,  weekTo: 14, isRequired: true  },
  { id: 'cl-005', label: 'Échographie T1 (11–13 SA)',                         category: 'medical',      weekFrom: 11, weekTo: 13, isRequired: true  },
  { id: 'cl-006', label: 'Informer l\'employeur (congé maternité)',           category: 'admin',        weekFrom: 10, weekTo: 16, isRequired: true  },
  { id: 'cl-007', label: 'Commencer la supplémentation en vitamine D',        category: 'medical',      weekFrom: 12, weekTo: 40, isRequired: false },
  { id: 'cl-008', label: 'Arrêter l\'alcool, tabac et médicaments non prescrits', category: 'medical', weekFrom: 4,  weekTo: 40, isRequired: true  },
  // ── T2 ──────────────────────────────────────────────────────
  { id: 'cl-009', label: 'Choisir la maternité et visiter si possible',       category: 'preparation',  weekFrom: 14, weekTo: 24, isRequired: true  },
  { id: 'cl-010', label: 'Prise de sang du 2ème trimestre',                  category: 'medical',      weekFrom: 18, weekTo: 22, isRequired: true  },
  { id: 'cl-011', label: 'Échographie morphologique T2',                      category: 'medical',      weekFrom: 20, weekTo: 24, isRequired: true  },
  { id: 'cl-012', label: 'Dépistage diabète gestationnel (HGPO)',             category: 'medical',      weekFrom: 24, weekTo: 28, isRequired: false },
  { id: 'cl-013', label: 'Commencer les cours de préparation à la naissance', category: 'preparation',  weekFrom: 20, weekTo: 30, isRequired: false },
  { id: 'cl-014', label: 'Rédiger le projet de naissance',                   category: 'preparation',  weekFrom: 22, weekTo: 32, isRequired: false },
  { id: 'cl-015', label: 'Choisir un pédiatre',                              category: 'preparation',  weekFrom: 20, weekTo: 32, isRequired: false },
  { id: 'cl-016', label: 'Prévenir la mutuelle (déclaration grossesse)',      category: 'admin',        weekFrom: 14, weekTo: 20, isRequired: false },
  { id: 'cl-017', label: 'Consulter l\'anesthésiste si péridurale souhaitée', category: 'medical',     weekFrom: 28, weekTo: 34, isRequired: false },
  // ── T3 ──────────────────────────────────────────────────────
  { id: 'cl-018', label: 'Échographie T3 (30–34 SA)',                         category: 'medical',      weekFrom: 30, weekTo: 34, isRequired: true  },
  { id: 'cl-019', label: 'Prélèvement streptocoque B',                       category: 'medical',      weekFrom: 35, weekTo: 37, isRequired: true  },
  { id: 'cl-020', label: 'Préparer le sac de maternité',                     category: 'preparation',  weekFrom: 32, weekTo: 36, isRequired: true  },
  { id: 'cl-021', label: 'Installer le siège auto bébé',                     category: 'baby_gear',    weekFrom: 32, weekTo: 37, isRequired: true  },
  { id: 'cl-022', label: 'Préparer la chambre de bébé',                      category: 'baby_gear',    weekFrom: 28, weekTo: 36, isRequired: false },
  { id: 'cl-023', label: 'Acheter les premiers vêtements et équipements',    category: 'baby_gear',    weekFrom: 24, weekTo: 36, isRequired: false },
  { id: 'cl-024', label: 'Visiter la maternité (parcours admission)',        category: 'preparation',  weekFrom: 28, weekTo: 36, isRequired: false },
  { id: 'cl-025', label: 'Finaliser le congé maternité avec l\'employeur',  category: 'admin',        weekFrom: 30, weekTo: 36, isRequired: true  },
  { id: 'cl-026', label: 'Préparer une liste de contacts d\'urgence',        category: 'preparation',  weekFrom: 34, weekTo: 38, isRequired: false },
  { id: 'cl-027', label: 'Prévenir famille / amis du plan',                 category: 'preparation',  weekFrom: 34, weekTo: 38, isRequired: false },
];

export function buildChecklist(
  stored: ChecklistItem[],
): ChecklistItem[] {
  return MASTER_CHECKLIST.map(template => {
    const existing = stored.find(s => s.id === template.id);
    return existing ?? { ...template, isDone: false };
  });
}

// ─────────────────────────────────────────────────────────────
//  CATEGORY META
// ─────────────────────────────────────────────────────────────

export const CHECKLIST_CATEGORY_META = {
  medical:      { label: 'Médical',      emoji: '🏥', color: '#A367A1' },
  admin:        { label: 'Administratif', emoji: '📄', color: '#3DA468' },
  preparation:  { label: 'Préparation',  emoji: '📦', color: '#FF7A40' },
  wellbeing:    { label: 'Bien-être',    emoji: '🌿', color: '#38BDF8' },
  baby_gear:    { label: 'Équipement',   emoji: '🛍️', color: '#FBBF24' },
} as const;
