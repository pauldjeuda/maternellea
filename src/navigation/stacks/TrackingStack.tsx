/**
 * navigation/stacks/TrackingStack.tsx
 *
 * Phase-aware wrapper for the Suivi (Tracking) tab.
 *
 * Depending on the user's active phase, it mounts a completely
 * different stack:
 *   cycle      → CycleStack
 *   pregnancy  → PregnancyStack
 *   postpartum → PostpartumStack
 *
 * Each sub-stack has its own screens, params, and header config.
 * They are lazily declared here as inline navigators so the
 * file stays self-contained and easy to split later.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore, selectActivePhase } from '@store/authStore';
import type {
  CycleStackParams,
  PregnancyStackParams,
  PostpartumStackParams,
} from '@types/navigation';
import { defaultHeaderOptions } from '../helpers';
import { PlaceholderScreen } from '../components/PlaceholderScreen';
import { tokens } from '@theme/tokens';

const { colors } = tokens;

// ─────────────────────────────────────────────────────────────
//  PLACEHOLDER SCREEN FACTORIES
// ─────────────────────────────────────────────────────────────

const p = (title: string, icon = '🚧', subtitle?: string) => () =>
  <PlaceholderScreen title={title} icon={icon} subtitle={subtitle} />;

// ─────────────────────────────────────────────────────────────
//  CYCLE STACK
// ─────────────────────────────────────────────────────────────

const CycleNav = createNativeStackNavigator<CycleStackParams>();

function CycleStack() {
  return (
    <CycleNav.Navigator
      screenOptions={{
        ...defaultHeaderOptions,
        headerStyle: { backgroundColor: colors.background },
      }}
    >
      <CycleNav.Screen
        name="CycleDashboard"
        component={p('Mon Cycle', '🌙', 'Suivez votre cycle menstruel et vos symptômes.')}
        options={{ headerShown: false }}
      />
      <CycleNav.Screen
        name="AddPeriod"
        component={p('Ajouter des règles', '🩸')}
        options={{ title: 'Nouvelles règles' }}
      />
      <CycleNav.Screen
        name="EditPeriod"
        component={p('Modifier les règles', '✏️')}
        options={{ title: 'Modifier les règles' }}
      />
      <CycleNav.Screen
        name="AddSymptoms"
        component={p('Symptômes du jour', '📝')}
        options={{ title: 'Symptômes' }}
      />
      <CycleNav.Screen
        name="EditSymptoms"
        component={p('Modifier les symptômes', '✏️')}
        options={{ title: 'Modifier les symptômes' }}
      />
      <CycleNav.Screen
        name="CycleHistory"
        component={p('Historique des cycles', '📈')}
        options={{ title: 'Historique' }}
      />
      <CycleNav.Screen
        name="CyclePredictions"
        component={p('Prédictions', '🔮')}
        options={{ title: 'Prédictions' }}
      />
      <CycleNav.Screen
        name="DayDetail"
        component={p('Détail du jour', '📅')}
        options={{ title: 'Ce jour' }}
      />
    </CycleNav.Navigator>
  );
}

// ─────────────────────────────────────────────────────────────
//  PREGNANCY STACK
// ─────────────────────────────────────────────────────────────

const PregnancyNav = createNativeStackNavigator<PregnancyStackParams>();

function PregnancyStack() {
  return (
    <PregnancyNav.Navigator
      screenOptions={{
        ...defaultHeaderOptions,
        headerStyle: { backgroundColor: colors.background },
      }}
    >
      <PregnancyNav.Screen
        name="PregnancyDashboard"
        component={p('Ma Grossesse', '🤰', 'Suivez votre grossesse semaine par semaine.')}
        options={{ headerShown: false }}
      />
      <PregnancyNav.Screen
        name="WeekDetail"
        component={p('Détails de la semaine', '👶')}
        options={({ route }) => ({ title: `Semaine ${route.params.week}` })}
      />
      <PregnancyNav.Screen
        name="Appointments"
        component={p('Rendez-vous', '📋')}
        options={{ title: 'Mes rendez-vous' }}
      />
      <PregnancyNav.Screen
        name="AddAppointment"
        component={p('Ajouter un RDV', '➕')}
        options={{ title: 'Nouveau rendez-vous' }}
      />
      <PregnancyNav.Screen
        name="EditAppointment"
        component={p('Modifier le RDV', '✏️')}
        options={{ title: 'Modifier le rendez-vous' }}
      />
      <PregnancyNav.Screen
        name="MedicalExams"
        component={p('Examens médicaux', '🔬')}
        options={{ title: 'Mes examens' }}
      />
      <PregnancyNav.Screen
        name="AddExam"
        component={p('Ajouter un examen', '➕')}
        options={{ title: 'Nouvel examen' }}
      />
      <PregnancyNav.Screen
        name="EditExam"
        component={p('Modifier l\'examen', '✏️')}
        options={{ title: 'Modifier l\'examen' }}
      />
      <PregnancyNav.Screen
        name="PregnancyJournal"
        component={p('Journal de grossesse', '📓')}
        options={{ title: 'Mon journal' }}
      />
      <PregnancyNav.Screen
        name="AddJournalEntry"
        component={p('Nouvelle entrée', '✍️')}
        options={{ title: 'Nouvelle entrée' }}
      />
      <PregnancyNav.Screen
        name="EditJournalEntry"
        component={p('Modifier l\'entrée', '✏️')}
        options={{ title: 'Modifier' }}
      />
      <PregnancyNav.Screen
        name="WeightTracking"
        component={p('Suivi du poids', '⚖️')}
        options={{ title: 'Mon poids' }}
      />
      <PregnancyNav.Screen
        name="PregnancyChecklist"
        component={p('Checklist grossesse', '✅')}
        options={{ title: 'Checklist' }}
      />
      <PregnancyNav.Screen
        name="PregnancyTimeline"
        component={p('Timeline', '⏱️')}
        options={{ title: 'Timeline' }}
      />
    </PregnancyNav.Navigator>
  );
}

// ─────────────────────────────────────────────────────────────
//  POSTPARTUM STACK  (includes baby + vaccines)
// ─────────────────────────────────────────────────────────────

const PostpartumNav = createNativeStackNavigator<PostpartumStackParams>();

function PostpartumStack() {
  return (
    <PostpartumNav.Navigator
      screenOptions={{
        ...defaultHeaderOptions,
        headerStyle: { backgroundColor: colors.background },
      }}
    >
      <PostpartumNav.Screen
        name="PostpartumDashboard"
        component={p('Post-partum', '🍼', 'Votre suivi post-partum et le carnet de bébé.')}
        options={{ headerShown: false }}
      />
      <PostpartumNav.Screen
        name="AddPostpartumEntry"
        component={p('Ajouter une entrée', '📝')}
        options={{ title: 'Mon état du jour' }}
      />
      <PostpartumNav.Screen
        name="PostpartumJournal"
        component={p('Journal post-partum', '📓')}
        options={{ title: 'Mon journal' }}
      />
      <PostpartumNav.Screen
        name="PostpartumAppointments"
        component={p('Rendez-vous post-nataux', '📋')}
        options={{ title: 'Mes rendez-vous' }}
      />
      <PostpartumNav.Screen
        name="AddPostpartumAppt"
        component={p('Ajouter un RDV', '➕')}
        options={{ title: 'Nouveau rendez-vous' }}
      />
      {/* Baby sub-screens */}
      <PostpartumNav.Screen
        name="BabyDashboard"
        component={p('Carnet de bébé', '👶')}
        options={{ title: 'Mon bébé' }}
      />
      <PostpartumNav.Screen
        name="EditBabyProfile"
        component={p('Profil de bébé', '✏️')}
        options={{ title: 'Profil de bébé' }}
      />
      <PostpartumNav.Screen
        name="GrowthTracking"
        component={p('Courbes de croissance', '📈')}
        options={{ title: 'Croissance' }}
      />
      <PostpartumNav.Screen
        name="AddGrowthEntry"
        component={p('Nouvelle mesure', '📏')}
        options={{ title: 'Nouvelle mesure' }}
      />
      <PostpartumNav.Screen
        name="EditGrowthEntry"
        component={p('Modifier la mesure', '✏️')}
        options={{ title: 'Modifier la mesure' }}
      />
      {/* Vaccine sub-screens */}
      <PostpartumNav.Screen
        name="VaccineCalendar"
        component={p('Calendrier vaccinal', '💉')}
        options={{ title: 'Vaccins' }}
      />
      <PostpartumNav.Screen
        name="VaccineDetail"
        component={p('Détail vaccin', '💉')}
        options={{ title: 'Détail du vaccin' }}
      />
      <PostpartumNav.Screen
        name="VaccineHistory"
        component={p('Historique vaccins', '📋')}
        options={{ title: 'Historique' }}
      />
      <PostpartumNav.Screen
        name="MarkVaccineDone"
        component={p('Valider le vaccin', '✅')}
        options={{ title: 'Valider le vaccin' }}
      />
    </PostpartumNav.Navigator>
  );
}

// ─────────────────────────────────────────────────────────────
//  TRACKING STACK SWITCHER
// ─────────────────────────────────────────────────────────────

export function TrackingStack() {
  const phase = useAuthStore(selectActivePhase);

  switch (phase) {
    case 'pregnancy':  return <PregnancyStack />;
    case 'postpartum': return <PostpartumStack />;
    default:           return <CycleStack />;
  }
}
