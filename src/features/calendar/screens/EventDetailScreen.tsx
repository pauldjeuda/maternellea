/**
 * features/calendar/screens/EventDetailScreen.tsx
 *
 * Unified event detail screen.
 * Reads the entityType + entityId from route params,
 * fetches the full object from the appropriate store,
 * and renders a rich detail card.
 *
 * Acts as a router: one screen, multiple entity types.
 * No navigation to sub-feature stacks — keeps the calendar
 * self-contained while still showing full info.
 */

import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { fmt, fmtDateTime, fmtShort } from '@utils/date';
import {
  usePregnancyStore, selectAppointments, selectExams,
} from '@store/pregnancyStore';
import { useCycleStore } from '@store/cycleStore';
import { useVaccineStore, selectVaccineRecords } from '@store/vaccineStore';
import { VACCINE_STATUS_CONFIG } from '@features/vaccines/types';
import type { CalendarStackParams, CalendarNavProp } from '@types/navigation';

const { colors, spacing, radius, fontSize, fontWeight, shadows } = tokens;
type Route = RouteProp<CalendarStackParams, 'EventDetail'>;

// ─── Generic info row ────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={irS.row}>
      <Text style={irS.icon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={irS.label}>{label}</Text>
        <Text style={irS.value}>{value}</Text>
      </View>
    </View>
  );
}

const irS = StyleSheet.create({
  row:   { flexDirection: 'row', gap: spacing[3], alignItems: 'flex-start' },
  icon:  { fontSize: 18, marginTop: 2 },
  label: { fontSize: fontSize.xs, color: colors.textTertiary, fontWeight: fontWeight.medium, marginBottom: 2 },
  value: { fontSize: fontSize.base, color: colors.textPrimary, fontWeight: fontWeight.medium },
});

// ─────────────────────────────────────────────────────────────
//  SCREEN
// ─────────────────────────────────────────────────────────────

export function EventDetailScreen() {
  const navigation = useNavigation<CalendarNavProp>();
  const route      = useRoute<Route>();
  const { entityId, entityType } = route.params;

  // ── Appointment ─────────────────────────────────────────────
  const appointments = usePregnancyStore(selectAppointments);
  const apt = entityType === 'appointment'
    ? appointments.find(a => a.id === entityId)
    : null;

  // ── Exam ────────────────────────────────────────────────────
  const exams = usePregnancyStore(selectExams);
  const exam  = entityType === 'exam'
    ? exams.find(e => e.id === entityId)
    : null;

  // ── Vaccine ─────────────────────────────────────────────────
  const vaccineRecords = useVaccineStore(selectVaccineRecords);
  const vaccRec = entityType === 'vaccine'
    ? vaccineRecords.find(r => r.id === entityId)
    : null;

  // ── Cycle Period ────────────────────────────────────────────
  const cycleEntries = useCycleStore(s => s.entries);
  const cycleEntry   = entityType === 'period'
    ? cycleEntries.find(e => e.id === entityId)
    : null;

  // ─────────────────────────────────────────────────────────────
  //  RENDER APPOINTMENT
  // ─────────────────────────────────────────────────────────────

  if (apt) {
    const pregActions = usePregnancyStore(s => s.actions);
    return (
      <ScrollView style={s.root} contentContainerStyle={s.content}>
        <View style={[s.hero, { borderColor: colors.phasePregnancy + '33', backgroundColor: colors.secondarySubtle }]}>
          <View style={s.heroTop}>
            <Text style={{ fontSize: 36 }}>📋</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.heroTitle}>{apt.title}</Text>
              {apt.speciality && <Text style={s.heroSub}>{apt.speciality}</Text>}
            </View>
            {apt.isCompleted && (
              <View style={s.doneBadge}>
                <Text style={s.doneText}>✓ Effectué</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.card}>
          <InfoRow icon="📅" label="Date et heure"  value={fmtDateTime(apt.date)} />
          {apt.doctorName  && <InfoRow icon="👩‍⚕️" label="Praticien"      value={apt.doctorName} />}
          {apt.location    && <InfoRow icon="📍"   label="Lieu"            value={apt.location} />}
          {apt.address     && <InfoRow icon="🗺️"   label="Adresse"         value={apt.address} />}
          {apt.notes       && <InfoRow icon="📝"   label="Notes"           value={apt.notes} />}
          {apt.reminderEnabled && apt.reminderMinutes && (
            <InfoRow icon="🔔" label="Rappel" value={
              apt.reminderMinutes === 60  ? '1 heure avant' :
              apt.reminderMinutes === 30  ? '30 minutes avant' :
              apt.reminderMinutes === 120 ? '2 heures avant' :
              apt.reminderMinutes === 1440 ? 'La veille' : `${apt.reminderMinutes} min avant`
            } />
          )}
        </View>

        {!apt.isCompleted && (
          <TouchableOpacity
            style={s.completeBtn}
            onPress={() => {
              pregActions.completeAppointment(apt.id);
              navigation.goBack();
            }}
          >
            <Text style={s.completeBtnText}>✓ Marquer comme effectué</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  RENDER EXAM
  // ─────────────────────────────────────────────────────────────

  if (exam) {
    return (
      <ScrollView style={s.root} contentContainerStyle={s.content}>
        <View style={[s.hero, { borderColor: colors.info + '33', backgroundColor: colors.infoLight + '40' }]}>
          <View style={s.heroTop}>
            <Text style={{ fontSize: 36 }}>🔬</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.heroTitle}>{exam.type}</Text>
            </View>
            {exam.isCompleted && (
              <View style={[s.doneBadge, { backgroundColor: colors.successLight }]}>
                <Text style={[s.doneText, { color: colors.successText }]}>✓ Fait</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.card}>
          <InfoRow icon="📅" label="Date prévue"    value={fmtShort(exam.scheduledDate)} />
          {exam.completedDate && <InfoRow icon="✅" label="Réalisé le"   value={fmtShort(exam.completedDate)} />}
          {exam.labName       && <InfoRow icon="🏥" label="Laboratoire"  value={exam.labName} />}
          {exam.doctorName    && <InfoRow icon="👩‍⚕️" label="Praticien"    value={exam.doctorName} />}
          {exam.result        && <InfoRow icon="📋" label="Résultat"     value={exam.result} />}
          {exam.notes         && <InfoRow icon="📝" label="Notes"        value={exam.notes} />}
        </View>
      </ScrollView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  RENDER VACCINE
  // ─────────────────────────────────────────────────────────────

  if (vaccRec) {
    const cfg    = VACCINE_STATUS_CONFIG[vaccRec.status];
    const isDone = vaccRec.status === 'done';
    return (
      <ScrollView style={s.root} contentContainerStyle={s.content}>
        <View style={[s.hero, {
          borderColor: (isDone ? colors.success : colors.warning) + '33',
          backgroundColor: (isDone ? colors.successLight : colors.warningLight) + '40',
        }]}>
          <View style={s.heroTop}>
            <Text style={{ fontSize: 36 }}>💉</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.heroTitle}>{vaccRec.vaccine.name}</Text>
              <Text style={s.heroSub}>{vaccRec.vaccine.diseases.slice(0, 3).join(', ')}</Text>
            </View>
            <View style={[s.doneBadge, { backgroundColor: cfg.bgColor }]}>
              <Text style={[s.doneText, { color: cfg.color }]}>{cfg.emoji} {cfg.label}</Text>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <InfoRow icon="📅" label="Date prévue"     value={fmtShort(vaccRec.scheduledDate ?? '')} />
          {vaccRec.administeredDate && <InfoRow icon="✅" label="Administré le" value={fmtShort(vaccRec.administeredDate)} />}
          {vaccRec.administeredBy   && <InfoRow icon="👩‍⚕️" label="Par"            value={vaccRec.administeredBy} />}
          {vaccRec.location         && <InfoRow icon="📍" label="Lieu"            value={vaccRec.location} />}
          {vaccRec.batchNumber      && <InfoRow icon="🔢" label="Lot"             value={vaccRec.batchNumber} />}
          {vaccRec.sideEffects      && <InfoRow icon="🌡️" label="Réactions"       value={vaccRec.sideEffects} />}
          {vaccRec.notes            && <InfoRow icon="📝" label="Notes"           value={vaccRec.notes} />}
        </View>
      </ScrollView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  RENDER PERIOD
  // ─────────────────────────────────────────────────────────────

  if (cycleEntry) {
    return (
      <ScrollView style={s.root} contentContainerStyle={s.content}>
        <View style={[s.hero, { borderColor: colors.phaseCycle + '33', backgroundColor: colors.primaryLight + '40' }]}>
          <View style={s.heroTop}>
            <Text style={{ fontSize: 36 }}>🩸</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.heroTitle}>Règles</Text>
              <Text style={s.heroSub}>
                {fmtShort(cycleEntry.startDate)}
                {cycleEntry.endDate ? ` → ${fmtShort(cycleEntry.endDate)}` : ' (en cours)'}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <InfoRow icon="📅" label="Début"    value={fmt(cycleEntry.startDate, 'd MMMM yyyy')} />
          {cycleEntry.endDate && <InfoRow icon="📅" label="Fin"      value={fmt(cycleEntry.endDate, 'd MMMM yyyy')} />}
          {cycleEntry.durationDays && <InfoRow icon="🕐" label="Durée"   value={`${cycleEntry.durationDays} jours`} />}
          {cycleEntry.flow && (
            <InfoRow icon="🩸" label="Intensité"  value={
              cycleEntry.flow === 'light'    ? 'Légères'    :
              cycleEntry.flow === 'medium'   ? 'Moyennes'   :
              cycleEntry.flow === 'heavy'    ? 'Abondantes' : 'Spotting'
            } />
          )}
          {cycleEntry.notes && <InfoRow icon="📝" label="Notes" value={cycleEntry.notes} />}
        </View>
      </ScrollView>
    );
  }

  // Not found
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <Text style={{ fontSize: 40, marginBottom: spacing[4] }}>🔍</Text>
      <Text style={{ fontSize: fontSize.lg, color: colors.textSecondary }}>Événement introuvable</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing[5], gap: spacing[4], paddingBottom: spacing[12] },

  hero: {
    borderRadius: radius['2xl'], padding: spacing[5], borderWidth: 1.5, gap: spacing[3],
  },
  heroTop:   { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  heroTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.extraBold, color: colors.textPrimary, letterSpacing: -0.3, lineHeight: fontSize.xl * 1.25 },
  heroSub:   { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing[1] },
  doneBadge: { borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: spacing[1], backgroundColor: colors.successLight, alignSelf: 'flex-start', flexShrink: 0 },
  doneText:  { fontSize: fontSize.xs, color: colors.successText, fontWeight: fontWeight.bold },

  card:    { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[5], gap: spacing[5], ...shadows.xs, borderWidth: 1, borderColor: colors.borderLight },

  completeBtn: {
    backgroundColor: colors.success, borderRadius: radius.full,
    paddingVertical: spacing[4], alignItems: 'center', ...shadows.sm,
  },
  completeBtnText: { color: colors.textInverse, fontWeight: fontWeight.semiBold, fontSize: fontSize.base },
});
