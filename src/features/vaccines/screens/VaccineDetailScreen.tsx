/**
 * features/vaccines/screens/VaccineDetailScreen.tsx
 *
 * Full vaccine detail — definition info, record details if done,
 * "Marquer comme effectué" CTA for pending ones.
 */

import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { fmtShort, fmt } from '@utils/date';
import { useVaccineData } from '../hooks/useVaccineData';
import { StatusBadge, DiseaseTag, SectionHeader } from '../components/VaccineUI';
import { daysLabel } from '../utils/vaccineCalc';
import { VACCINE_STATUS_CONFIG } from '../types';
import type { PostpartumStackParams, PostpartumNavProp } from '@types/navigation';
import { Button } from '@components/ui';

const { colors, spacing, radius, fontSize, fontWeight, shadows } = tokens;
type Route = RouteProp<PostpartumStackParams, 'VaccineDetail'>;

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
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
  row:   { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  icon:  { fontSize: 20, marginTop: 1 },
  label: { fontSize: fontSize.xs, color: colors.textTertiary, fontWeight: fontWeight.medium, marginBottom: 2 },
  value: { fontSize: fontSize.base, color: colors.textPrimary, fontWeight: fontWeight.medium },
});

export function VaccineDetailScreen() {
  const navigation = useNavigation<PostpartumNavProp>();
  const route      = useRoute<Route>();
  const { recordId, babyId } = route.params;

  const { allStatuses, vaccineActions, baby } = useVaccineData(babyId);

  // Find by record ID or by vaccine definition ID (if no record yet)
  const result = allStatuses.find(s => s.record?.id === recordId || s.definition.id === recordId);

  if (!result) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <Text style={{ fontSize: 44 }}>🔍</Text>
        <Text style={{ fontSize: fontSize.lg, color: colors.textSecondary, marginTop: spacing[3] }}>Vaccin introuvable</Text>
      </View>
    );
  }

  const { definition, record, status, scheduledDate, daysFromNow, isDone } = result;
  const cfg    = VACCINE_STATUS_CONFIG[status];
  const accent = isDone ? colors.success :
                 status === 'overdue'  ? colors.error :
                 status === 'due_soon' ? colors.warning : colors.secondary;

  function handleDelete() {
    Alert.alert(
      'Supprimer cet enregistrement ?',
      'Le vaccin repassera en statut "à venir".',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            if (record) vaccineActions.deleteRecord(record.id);
            navigation.goBack();
          },
        },
      ],
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing[5], padding: spacing[5], paddingBottom: spacing[12] }}
      >

        {/* ── HERO ─────────────────────────────────────── */}
        <View style={[hero.card, { backgroundColor: accent + '0D', borderColor: accent + '22' }]}>
          <View style={hero.top}>
            <View style={{ flex: 1 }}>
              <StatusBadge status={status} style={{ marginBottom: spacing[3] }} />
              <Text style={hero.name}>{definition.name}</Text>
              <Text style={hero.series}>
                {definition.seriesName}
                {definition.numberOfDoses > 1
                  ? ` — dose ${definition.doseNumber} sur ${definition.numberOfDoses}`
                  : ''}
              </Text>
            </View>
            <Text style={{ fontSize: 44 }}>💉</Text>
          </View>

          {/* Date line */}
          <View style={hero.dateLine}>
            <Text style={hero.dateIcon}>{isDone ? '✅' : '📅'}</Text>
            <Text style={[hero.dateText, { color: accent }]}>
              {isDone && record?.administeredDate
                ? `Vacciné le ${fmt(record.administeredDate, 'd MMMM yyyy')}`
                : `Prévu le ${fmtShort(scheduledDate)} · ${daysLabel(daysFromNow)}`}
            </Text>
          </View>
        </View>

        {/* ── DISEASES ─────────────────────────────────── */}
        <View style={secS.card}>
          <SectionHeader title="Maladies couvertes" style={{ marginBottom: spacing[3] }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
            {definition.diseases.map(d => <DiseaseTag key={d} name={d} />)}
          </View>
          {definition.description && (
            <Text style={secS.desc}>{definition.description}</Text>
          )}
        </View>

        {/* ── SCHEDULE INFO ─────────────────────────────── */}
        <View style={secS.card}>
          <SectionHeader title="Calendrier" style={{ marginBottom: spacing[4] }} />
          <View style={{ gap: spacing[4] }}>
            <InfoRow icon="👶" label="Âge recommandé"  value={definition.recommendedAgeLabel} />
            <InfoRow icon="📅" label="Date prévue"     value={fmtShort(scheduledDate)} />
            <InfoRow icon="🔢" label="Doses dans la série" value={`${definition.doseNumber}/${definition.numberOfDoses}`} />
            <InfoRow icon="📋" label="Statut"          value={cfg.label} />
            {definition.isMandatory && (
              <View style={secS.mandatory}>
                <Text style={{ fontSize: 16 }}>⚖️</Text>
                <Text style={secS.mandatoryText}>
                  Ce vaccin est obligatoire en {definition.seriesName === 'BCG' ? 'zones à risque' : 'France'}.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── ADMINISTERED DETAILS (if done) ───────────── */}
        {isDone && record && (
          <View style={secS.card}>
            <SectionHeader title="Détails de l'administration" style={{ marginBottom: spacing[4] }} />
            <View style={{ gap: spacing[4] }}>
              <InfoRow icon="📅" label="Date réelle" value={fmtShort(record.administeredDate!)} />
              {record.administeredBy && <InfoRow icon="👩‍⚕️" label="Administré par" value={record.administeredBy} />}
              {record.location      && <InfoRow icon="📍" label="Lieu"            value={record.location} />}
              {record.batchNumber   && <InfoRow icon="🔢" label="Numéro de lot"   value={record.batchNumber} />}
              {record.sideEffects   && (
                <View style={secS.sideEffect}>
                  <Text style={{ fontSize: 16 }}>🌡️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={secS.seLabel}>Réactions observées</Text>
                    <Text style={secS.seText}>{record.sideEffects}</Text>
                  </View>
                </View>
              )}
              {record.notes && (
                <View>
                  <Text style={secS.seLabel}>Notes</Text>
                  <Text style={secS.seText}>{record.notes}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── DEFINITION NOTES ──────────────────────────── */}
        {definition.notes && (
          <View style={[secS.card, { borderColor: colors.infoLight + '55', backgroundColor: colors.infoLight + '20' }]}>
            <Text style={{ fontSize: 16, marginBottom: spacing[2] }}>ℹ️</Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: fontSize.sm * 1.6 }}>
              {definition.notes}
            </Text>
          </View>
        )}

        {/* ── ACTIONS ───────────────────────────────────── */}
        {!isDone ? (
          <Button
            label="Marquer comme effectué"
            onPress={() => navigation.navigate('MarkVaccineDone', {
              recordId: record?.id ?? definition.id,
              babyId,
            })}
            fullWidth
            size="lg"
          />
        ) : (
          <Button
            label="Supprimer cet enregistrement"
            variant="destructive"
            onPress={handleDelete}
            fullWidth
          />
        )}

      </ScrollView>
    </View>
  );
}

const hero = StyleSheet.create({
  card:     { borderRadius: radius['2xl'], padding: spacing[6], borderWidth: 1.5, gap: spacing[4] },
  top:      { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  name:     { fontSize: fontSize['2xl'], fontWeight: fontWeight.extraBold, color: colors.textPrimary, lineHeight: fontSize['2xl'] * 1.2, marginBottom: spacing[1] },
  series:   { fontSize: fontSize.sm, color: colors.textSecondary },
  dateLine: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  dateIcon: { fontSize: 18 },
  dateText: { fontSize: fontSize.base, fontWeight: fontWeight.semiBold },
});

const secS = StyleSheet.create({
  card:         { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[5], ...shadows.xs, borderWidth: 1, borderColor: colors.borderLight },
  desc:         { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing[3], lineHeight: fontSize.sm * 1.6 },
  mandatory:    { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2], backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing[3] },
  mandatoryText:{ flex: 1, fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.medium },
  sideEffect:   { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2], backgroundColor: colors.warningLight, borderRadius: radius.lg, padding: spacing[3] },
  seLabel:      { fontSize: fontSize.xs, color: colors.textTertiary, fontWeight: fontWeight.semiBold, marginBottom: 2 },
  seText:       { fontSize: fontSize.sm, color: colors.textSecondary },
});
