/**
 * features/home/components/CycleDashboard.tsx
 *
 * Home dashboard — profil Cycle.
 *
 * Sections:
 *   1. Hero card : prochaines règles (jours restants + dates)
 *   2. Fenêtre fertile (dates + statut actuel)
 *   3. Symptômes récents (3 dernières entrées)
 *   4. Actions rapides : Ajouter règles / Symptômes / Prédictions
 *   5. Conseil du jour
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { SYMPTOM_LABELS, MOOD_EMOJIS } from '@constants';

import {
  HeroCard, SurfaceCard, StatRow, StatPill, QuickActionsRow, QuickAction,
  TipCard, SectionTitle, InfoRow, InlineProgress, MoodDot,
} from './DashboardCards';
import type { CycleHomeData } from '../hooks/useHomeData';
import { fmtShort, dayLabel, daysUntil, isDateInRange, todayISO } from '@utils/date';

const { colors, spacing, radius, fontSize, fontWeight, palette } = tokens;

interface Props {
  data: CycleHomeData;
}

export function CycleDashboard({ data }: Props) {
  const { prediction, recentSymptoms, tipArticle, firstName } = data;
  const navigation = useNavigation();

  const today       = todayISO();
  const daysLeft    = prediction ? daysUntil(prediction.nextPeriodStart) : null;
  const inFertile   = prediction ? isDateInRange(today, prediction.fertileWindowStart, prediction.fertileWindowEnd) : false;
  const inPeriod    = data.cycleEntries.some(e => {
    const end = e.endDate ?? e.startDate;
    return today >= e.startDate && today <= end;
  });

  const phaseLabel =
    inPeriod   ? 'En cours de règles' :
    inFertile  ? '🌿 Fenêtre fertile active' :
    daysLeft !== null && daysLeft <= 3 ? '⚠️ Règles imminentes' :
    '🌙 Phase lutéale';

  return (
    <View style={styles.root}>

      {/* ── 1. HERO : Prochaines règles ───────────────────── */}
      <HeroCard
        label="Prochaines règles"
        metric={daysLeft === 0 ? 'Aujourd\'hui' : daysLeft === 1 ? 'Demain' : `J − ${daysLeft ?? '?'}`}
        metricSub={prediction ? `· ${fmtShort(prediction.nextPeriodStart)}` : undefined}
        emoji="🩸"
        accent={colors.phaseCycle}
        bg={colors.primarySubtle}
        style={styles.heroCard}
      >
        <View style={styles.phasePill}>
          <Text style={styles.phaseText}>{phaseLabel}</Text>
        </View>
        <InlineProgress
          value={prediction ? Math.min(100, Math.round(((28 - (daysLeft ?? 28)) / 28) * 100)) : 50}
          color={colors.phaseCycle}
          trackColor={colors.primaryLight}
          height={5}
          style={{ marginTop: spacing[4] }}
        />
        <View style={styles.heroFooter}>
          <Text style={styles.heroFooterText}>
            Cycle moyen : {prediction?.averageCycleLength ?? 28} jours
          </Text>
          <Text style={[styles.heroFooterText, { color: prediction?.confidence === 'high' ? colors.success : colors.warning }]}>
            {prediction?.confidence === 'high' ? '● Haute précision' :
             prediction?.confidence === 'medium' ? '● Précision moyenne' : '● Peu de données'}
          </Text>
        </View>
      </HeroCard>

      {/* ── 2. FENÊTRE FERTILE ────────────────────────────── */}
      <SurfaceCard
        tint={inFertile ? colors.fertileSubtle : undefined}
        outlined={inFertile}
        style={inFertile ? { borderColor: colors.fertile + '55' } : {}}
      >
        <View style={styles.fertileRow}>
          <View style={[styles.fertileIcon, { backgroundColor: colors.fertileLight }]}>
            <Text style={{ fontSize: 22 }}>🌿</Text>
          </View>
          <View style={styles.fertileText}>
            <Text style={styles.fertileLabel}>Fenêtre fertile</Text>
            {prediction ? (
              <Text style={styles.fertileDate}>
                {fmtShort(prediction.fertileWindowStart)} → {fmtShort(prediction.fertileWindowEnd)}
              </Text>
            ) : <Text style={styles.fertileDate}>—</Text>}
          </View>
          <View style={styles.fertileSub}>
            <Text style={styles.fertileSubLabel}>Ovulation</Text>
            {prediction ? (
              <Text style={[styles.fertileSubValue, { color: colors.fertile }]}>
                {dayLabel(prediction.ovulationDate)}
              </Text>
            ) : <Text style={styles.fertileSubValue}>—</Text>}
          </View>
        </View>
      </SurfaceCard>

      {/* ── 3. SYMPTÔMES RÉCENTS ──────────────────────────── */}
      {recentSymptoms.length > 0 && (
        <View>
          <SectionTitle
            title="Symptômes récents"
            actionLabel="Historique"
            onAction={() => navigation.navigate('CycleHistory' as never)}
            style={styles.sectionTitle}
          />
          <SurfaceCard padded={false} style={{ overflow: 'hidden' }}>
            {recentSymptoms.map((entry, idx) => (
              <View key={entry.id}>
                <View style={styles.symptomRow}>
                  <MoodDot level={entry.mood} size={34} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.symptomDate}>{dayLabel(entry.date)}</Text>
                    <Text style={styles.symptomTags} numberOfLines={1}>
                      {entry.symptoms.slice(0, 3).map(s => SYMPTOM_LABELS[s] ?? s).join(' · ')}
                    </Text>
                  </View>
                  <Text style={styles.symptomMoodText}>{MOOD_EMOJIS[entry.mood]}</Text>
                </View>
                {idx < recentSymptoms.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </SurfaceCard>
        </View>
      )}

      {/* ── 4. ACTIONS RAPIDES ────────────────────────────── */}
      <QuickActionsRow>
        <QuickAction
          emoji="🩸" label="Règles"
          accent={colors.phaseCycle}
          onPress={() => navigation.navigate('AddPeriod' as never)}
        />
        <QuickAction
          emoji="📝" label="Symptômes"
          accent={colors.secondary}
          onPress={() => navigation.navigate('AddSymptoms' as never, { date: todayISO() } as never)}
        />
        <QuickAction
          emoji="🔮" label="Prédictions"
          accent={colors.fertile}
          onPress={() => navigation.navigate('CyclePredictions' as never)}
        />
        <QuickAction
          emoji="📊" label="Historique"
          accent={colors.accent}
          onPress={() => navigation.navigate('CycleHistory' as never)}
        />
      </QuickActionsRow>

      {/* ── 5. CONSEIL DU JOUR ────────────────────────────── */}
      <TipCard
        label="Conseil du jour"
        title={tipArticle.title}
        summary={tipArticle.summary}
        readMin={tipArticle.readTimeMinutes}
        accent={colors.phaseCycle}
        onPress={() => navigation.navigate('AdviceDetail' as never, { articleId: tipArticle.id } as never)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  root:         { gap: spacing[4] },
  heroCard:     { },
  phasePill: {
    alignSelf:         'flex-start',
    backgroundColor:   colors.phaseCycle + '1A',
    borderRadius:      radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical:   spacing[1],
    marginTop:         spacing[2],
  },
  phaseText:    { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold, color: colors.phaseCycle },
  heroFooter:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing[3] },
  heroFooterText: { fontSize: fontSize.xs, color: colors.textTertiary },
  fertileRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  fertileIcon:  { width: 44, height: 44, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  fertileText:  { flex: 1, gap: spacing[0.5] },
  fertileLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textPrimary },
  fertileDate:  { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.fertile },
  fertileSub:   { alignItems: 'flex-end', gap: spacing[0.5] },
  fertileSubLabel: { fontSize: fontSize.xs, color: colors.textTertiary },
  fertileSubValue: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold },
  sectionTitle: { marginBottom: spacing[2] },
  symptomRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[4] },
  symptomDate:  { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textPrimary },
  symptomTags:  { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  symptomMoodText: { fontSize: 22 },
  divider:      { height: 1, backgroundColor: colors.borderLight, marginHorizontal: spacing[4] },
});
