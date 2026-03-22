/**
 * features/home/components/PregnancyDashboard.tsx
 *
 * Home dashboard — profil Grossesse.
 *
 * Sections:
 *   1. Hero card : semaine actuelle + anneau de progression
 *   2. Stats : trimestre · jours restants · taille bébé
 *   3. Prochain rendez-vous
 *   4. Checklist du moment (3 items max)
 *   5. Actions rapides : Journal / Rendez-vous / Poids / Timeline
 *   6. Conseil de la semaine
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { TRIMESTER_LABELS } from '@constants';

import {
  HeroCard, SurfaceCard, StatRow, StatPill, QuickActionsRow, QuickAction,
  TipCard, SectionTitle, InfoRow, InlineProgress,
} from './DashboardCards';
import type { PregnancyHomeData } from '../hooks/useHomeData';
import { fmtShort, fmtDateTime, dayLabel, daysUntil } from '@utils/date';
import { PREGNANCY } from '@constants';

const { colors, spacing, radius, fontSize, fontWeight, palette } = tokens;

interface Props { data: PregnancyHomeData; }

export function PregnancyDashboard({ data }: Props) {
  const { pregnancy, progressPct, weekLabel, nextAppointment,
          weeklyContent, checklist, tipArticle } = data;
  const navigation = useNavigation();

  const dueInDays   = pregnancy ? daysUntil(pregnancy.dueDate) : null;
  const dueInWeeks  = dueInDays !== null ? Math.floor(dueInDays / 7) : null;

  const trimesterColor = useMemo(() => {
    if (!pregnancy) return colors.phasePregnancy;
    return pregnancy.trimester === 1 ? colors.fertile :
           pregnancy.trimester === 2 ? colors.phasePregnancy :
           colors.phaseCycle;
  }, [pregnancy?.trimester]);

  const pendingItems = checklist.filter(i => !i.done);
  const doneItems    = checklist.filter(i => i.done);
  const checklistPct = Math.round((doneItems.length / checklist.length) * 100);

  if (!pregnancy) {
    return (
      <SurfaceCard>
        <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center' }}>
          Configurez votre grossesse dans l'onglet Suivi.
        </Text>
      </SurfaceCard>
    );
  }

  return (
    <View style={styles.root}>

      {/* ── 1. HERO : Semaine actuelle ────────────────────── */}
      <HeroCard
        label={TRIMESTER_LABELS[pregnancy.trimester]}
        metric={weekLabel}
        metricSub=""
        emoji={weeklyContent.emoji}
        accent={trimesterColor}
        bg={trimesterColor + '0D'}
        style={styles.heroCard}
      >
        {/* Progress bar */}
        <View style={styles.progressWrap}>
          <InlineProgress
            value={progressPct}
            color={trimesterColor}
            trackColor={trimesterColor + '22'}
            height={8}
          />
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: trimesterColor }]}>
              {progressPct}% de la grossesse
            </Text>
            {dueInDays !== null && (
              <Text style={styles.progressDue}>
                DPA : {fmtShort(pregnancy.dueDate)}
              </Text>
            )}
          </View>
        </View>

        {/* Baby snippet */}
        <View style={styles.babySnippet}>
          <Text style={styles.babySnippetText}>
            Bébé a la taille de {weeklyContent.babySize} · {weeklyContent.babyWeightGrams} g
          </Text>
        </View>
      </HeroCard>

      {/* ── 2. STATS ──────────────────────────────────────── */}
      <StatRow>
        <StatPill
          icon="📅" label="Jours restants"
          value={dueInDays !== null ? `${dueInDays} j` : '—'}
          accent={trimesterColor}
        />
        <StatPill
          icon="⚖️" label="Poids bébé"
          value={`${weeklyContent.babyWeightGrams} g`}
          accent={colors.phasePregnancy}
        />
        <StatPill
          icon="📏" label="Taille"
          value={`${weeklyContent.babySizeCm} cm`}
          accent={colors.fertile}
        />
      </StatRow>

      {/* ── 3. PROCHAIN RDV ───────────────────────────────── */}
      {nextAppointment && (
        <View>
          <SectionTitle
            title="Prochain rendez-vous"
            actionLabel="Tous les RDV"
            onAction={() => navigation.navigate('Appointments' as never)}
            style={styles.sectionTitle}
          />
          <SurfaceCard
            onPress={() => navigation.navigate('Appointments' as never)}
            outlined
            style={{ borderColor: trimesterColor + '44' }}
          >
            <InfoRow
              icon="🏥"
              title={nextAppointment.title}
              subtitle={[
                nextAppointment.doctorName,
                fmtDateTime(nextAppointment.date),
              ].filter(Boolean).join(' · ')}
              accent={trimesterColor}
              right={
                <View style={[styles.aptDayBadge, { backgroundColor: trimesterColor + '1A' }]}>
                  <Text style={[styles.aptDayText, { color: trimesterColor }]}>
                    {dayLabel(nextAppointment.date)}
                  </Text>
                </View>
              }
            />
            {nextAppointment.location && (
              <Text style={styles.aptLocation}>📍 {nextAppointment.location}</Text>
            )}
          </SurfaceCard>
        </View>
      )}

      {/* ── 4. CHECKLIST ──────────────────────────────────── */}
      <View>
        <SectionTitle
          title="Checklist grossesse"
          actionLabel="Tout voir"
          onAction={() => navigation.navigate('PregnancyChecklist' as never)}
          style={styles.sectionTitle}
        />
        <SurfaceCard>
          <View style={styles.checklistProgress}>
            <Text style={styles.checklistProgressText}>{doneItems.length}/{checklist.length} complétées</Text>
            <InlineProgress
              value={checklistPct}
              color={trimesterColor}
              trackColor={trimesterColor + '1A'}
              height={5}
              style={{ marginTop: spacing[2] }}
            />
          </View>
          {pendingItems.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.checkRow}>
              <View style={[styles.checkBox, { borderColor: trimesterColor }]} />
              <Text style={styles.checkLabel}>{item.label}</Text>
              {item.week && (
                <View style={[styles.checkWeekBadge, { backgroundColor: trimesterColor + '15' }]}>
                  <Text style={[styles.checkWeekText, { color: trimesterColor }]}>SA {item.week}</Text>
                </View>
              )}
            </View>
          ))}
          {pendingItems.length > 3 && (
            <TouchableOpacity onPress={() => navigation.navigate('PregnancyChecklist' as never)}>
              <Text style={[styles.checkMore, { color: trimesterColor }]}>
                +{pendingItems.length - 3} à venir
              </Text>
            </TouchableOpacity>
          )}
        </SurfaceCard>
      </View>

      {/* ── 5. ACTIONS RAPIDES ────────────────────────────── */}
      <QuickActionsRow>
        <QuickAction
          emoji="📓" label="Journal"
          accent={trimesterColor}
          onPress={() => navigation.navigate('PregnancyJournal' as never)}
        />
        <QuickAction
          emoji="📋" label="Rendez-vous"
          accent={colors.phasePregnancy}
          onPress={() => navigation.navigate('Appointments' as never)}
        />
        <QuickAction
          emoji="⚖️" label="Mon poids"
          accent={colors.fertile}
          onPress={() => navigation.navigate('WeightTracking' as never)}
        />
        <QuickAction
          emoji="👶" label="Sem. {pregnancy.currentWeek}"
          accent={colors.accent}
          onPress={() => navigation.navigate('WeekDetail' as never, { week: pregnancy.currentWeek } as never)}
        />
      </QuickActionsRow>

      {/* ── 6. CONSEIL DE LA SEMAINE ──────────────────────── */}
      <TipCard
        label={`Semaine ${pregnancy.currentWeek}`}
        title={weeklyContent.nutritionTip.substring(0, 50) + '…'}
        summary={weeklyContent.nutritionTip}
        readMin={3}
        accent={trimesterColor}
      />

      {/* ── 7. ARTICLE DU JOUR ────────────────────────────── */}
      <TipCard
        label="Article"
        title={tipArticle.title}
        summary={tipArticle.summary}
        readMin={tipArticle.readTimeMinutes}
        accent={colors.phasePregnancy}
        onPress={() => navigation.navigate('AdviceDetail' as never, { articleId: tipArticle.id } as never)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  root:      { gap: spacing[4] },
  heroCard:  {},
  progressWrap:   { marginTop: spacing[4], gap: spacing[2] },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel:  { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },
  progressDue:    { fontSize: fontSize.xs, color: colors.textTertiary },
  babySnippet:   {
    marginTop:       spacing[3],
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius:    radius.lg,
    paddingVertical:   spacing[2],
    paddingHorizontal: spacing[3],
  },
  babySnippetText: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
  sectionTitle:    { marginBottom: spacing[2] },
  aptDayBadge: {
    borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: spacing[0.5],
  },
  aptDayText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  aptLocation: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing[3], paddingLeft: spacing[1] },
  checklistProgress: { marginBottom: spacing[4] },
  checklistProgressText: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textSecondary },
  checkRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginTop: spacing[3] },
  checkBox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, flexShrink: 0 },
  checkLabel: { flex: 1, fontSize: fontSize.sm, color: colors.textPrimary },
  checkWeekBadge: { borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: 2 },
  checkWeekText:  { fontSize: fontSize['2xs'], fontWeight: fontWeight.bold },
  checkMore:  { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, marginTop: spacing[3], textAlign: 'center' },
});
