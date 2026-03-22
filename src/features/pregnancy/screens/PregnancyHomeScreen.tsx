/**
 * features/pregnancy/screens/PregnancyHomeScreen.tsx
 *
 * Main pregnancy dashboard. Shows:
 *   1. Hero: semaine + anneau de progression
 *   2. Développement de bébé cette semaine
 *   3. Changements du corps
 *   4. Prochain RDV
 *   5. Checklist progress
 *   6. Raccourcis rapides
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { TRIMESTER_LABELS } from '@constants';
import { fmtShort } from '@utils/date';
import { usePregnancyData } from '../hooks/usePregnancyData';
import {
  ProgressRing, TrimesterBar, AppointmentCard,
  SectionHeader, EmptyCard,
} from '../components/PregnancyUI';
import type { PregnancyNavProp } from '@types/navigation';

const { colors, spacing, radius, fontSize, fontWeight, shadows } = tokens;
type Nav = PregnancyNavProp;

// ─── Quick action button ──────────────────────────────────────

function QuickBtn({ emoji, label, onPress, accent }: {
  emoji: string; label: string; onPress: () => void; accent: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.78} style={qbS.wrap}>
      <View style={[qbS.icon, { backgroundColor: accent + '1A' }]}>
        <Text style={{ fontSize: 24 }}>{emoji}</Text>
      </View>
      <Text style={qbS.label} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

const qbS = StyleSheet.create({
  wrap:  { flex: 1, alignItems: 'center', gap: spacing[2] },
  icon:  { width: 54, height: 54, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium, textAlign: 'center' },
});

// ─── Info card ───────────────────────────────────────────────

function InfoCard({ title, text, accent, emoji }: {
  title: string; text: string; accent: string; emoji: string;
}) {
  return (
    <View style={[icS.card, { borderLeftColor: accent }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
        <Text style={[icS.title, { color: accent }]}>{title}</Text>
      </View>
      <Text style={icS.text}>{text}</Text>
    </View>
  );
}

const icS = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[5],
    borderLeftWidth: 3, ...shadows.xs, borderWidth: 1, borderColor: colors.borderLight,
  },
  title: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, letterSpacing: 0.3, textTransform: 'uppercase' },
  text:  { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: fontSize.base * 1.65 },
});

// ─────────────────────────────────────────────────────────────
//  SCREEN
// ─────────────────────────────────────────────────────────────

export function PregnancyHomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets     = useSafeAreaInsets();
  const {
    pregnancy, progress, weeklyContent,
    nextAppointment, checklistProgress, actions,
  } = usePregnancyData();

  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 700));
    setRefreshing(false);
  }

  if (!pregnancy || !progress) {
    return (
      <View style={[s.root, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <EmptyCard
          emoji="🤰"
          title="Configurez votre grossesse"
          subtitle="Entrez la date de vos dernières règles pour commencer le suivi."
        />
      </View>
    );
  }

  const tc = progress.trimesterColor;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* ── HEADER ────────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Ma grossesse</Text>
          <Text style={[s.trimLabel, { color: tc }]}>{progress.trimesterLabel}</Text>
        </View>
        <TouchableOpacity
          style={[s.journalBtn, { backgroundColor: tc + '1A' }]}
          onPress={() => navigation.navigate('PregnancyJournal')}
        >
          <Text style={{ fontSize: 20 }}>📓</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tc} />
        }
      >

        {/* ── HERO ──────────────────────────────────────── */}
        <View style={[hero.card, { backgroundColor: tc + '0D', borderColor: tc + '2A' }]}>
          <ProgressRing pct={progress.pct} size={130} stroke={10} color={tc}>
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Text style={[hero.weekNum, { color: tc }]}>{progress.week}</Text>
              <Text style={[hero.weekLabel, { color: tc + 'BB' }]}>SA</Text>
              {progress.day > 0 && (
                <Text style={hero.weekDay}>+{progress.day}j</Text>
              )}
            </View>
          </ProgressRing>

          <View style={hero.right}>
            <Text style={hero.pct}>{progress.pct}%</Text>
            <Text style={hero.pctLabel}>de la grossesse</Text>

            <View style={hero.dueDays}>
              <Text style={hero.dueNum}>{progress.daysLeft}</Text>
              <Text style={hero.dueLabel}>jours restants</Text>
            </View>

            <Text style={hero.dueDateText}>
              DPA : {fmtShort(progress.dueDate)}
            </Text>
          </View>
        </View>

        {/* Trimester bar */}
        <TrimesterBar currentWeek={progress.week} color={tc} />

        {/* ── BÉBÉ CETTE SEMAINE ──────────────────────────── */}
        {weeklyContent && (
          <TouchableOpacity
            onPress={() => navigation.navigate('WeekDetail', { week: progress.week })}
            style={[babyS.card, { backgroundColor: tc + '08', borderColor: tc + '22' }]}
            activeOpacity={0.88}
          >
            <View style={babyS.header}>
              <Text style={babyS.title}>Bébé à {progress.week} SA</Text>
              <Text style={babyS.emoji}>{weeklyContent.emoji}</Text>
            </View>
            <Text style={babyS.size}>
              Taille d'<Text style={{ fontWeight: fontWeight.bold, color: tc }}>{weeklyContent.babySize}</Text>
              {' '}· {weeklyContent.babySizeCm} cm · {weeklyContent.babyWeightGrams} g
            </Text>
            <Text style={babyS.dev} numberOfLines={3}>{weeklyContent.babyDevelopment}</Text>
            <Text style={[babyS.more, { color: tc }]}>Voir le détail de la semaine →</Text>
          </TouchableOpacity>
        )}

        {/* ── INFO CARDS ──────────────────────────────────── */}
        {weeklyContent && (
          <View style={{ gap: spacing[3] }}>
            <InfoCard
              title="Votre corps"
              text={weeklyContent.motherChanges}
              accent={tc}
              emoji="🤰"
            />
            <InfoCard
              title="Nutrition"
              text={weeklyContent.nutritionTip}
              accent={colors.fertile}
              emoji="🥗"
            />
            {weeklyContent.wellbeingTip && (
              <InfoCard
                title="Bien-être"
                text={weeklyContent.wellbeingTip}
                accent={colors.accent}
                emoji="🌿"
              />
            )}
            {weeklyContent.warningSign && (
              <View style={[warnS.card]}>
                <Text style={warnS.icon}>⚠️</Text>
                <Text style={warnS.text}>{weeklyContent.warningSign}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── PROCHAIN RDV ──────────────────────────────── */}
        <View>
          <SectionHeader
            title="Prochain rendez-vous"
            actionLabel="Tous"
            onAction={() => navigation.navigate('Appointments')}
            style={s.sectionTitle}
          />
          {nextAppointment ? (
            <AppointmentCard
              apt={nextAppointment}
              onPress={() => navigation.navigate('Appointments')}
              onComplete={() => actions.completeAppointment(nextAppointment.id)}
            />
          ) : (
            <EmptyCard
              emoji="📅"
              title="Aucun rendez-vous"
              subtitle="Ajoutez vos consultations prénatales."
              actionLabel="Ajouter un RDV"
              onAction={() => navigation.navigate('AddAppointment', {})}
            />
          )}
        </View>

        {/* ── CHECKLIST ─────────────────────────────────── */}
        <TouchableOpacity
          onPress={() => navigation.navigate('PregnancyChecklist')}
          style={clS.card}
          activeOpacity={0.86}
        >
          <View style={clS.header}>
            <Text style={clS.title}>Checklist grossesse</Text>
            <Text style={[clS.pct, { color: tc }]}>{checklistProgress.pct}%</Text>
          </View>
          <View style={clS.bar}>
            <View style={[clS.fill, { width: `${checklistProgress.pct}%`, backgroundColor: tc }]} />
          </View>
          <Text style={clS.sub}>
            {checklistProgress.done}/{checklistProgress.total} tâches complétées
          </Text>
        </TouchableOpacity>

        {/* ── RACCOURCIS ────────────────────────────────── */}
        <View style={{ flexDirection: 'row', gap: spacing[3] }}>
          <QuickBtn emoji="📓" label="Journal"    accent={tc}              onPress={() => navigation.navigate('PregnancyJournal')} />
          <QuickBtn emoji="📋" label="Examens"    accent={colors.secondary} onPress={() => navigation.navigate('MedicalExams')} />
          <QuickBtn emoji="⚖️" label="Mon poids"  accent={colors.fertile}   onPress={() => navigation.navigate('WeightTracking')} />
          <QuickBtn emoji="🗓️" label="Rendez-vous" accent={colors.accent}   onPress={() => navigation.navigate('Appointments')} />
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[5], paddingTop: spacing[3], paddingBottom: spacing[4],
    backgroundColor: colors.background,
  },
  title:       { fontSize: fontSize['2xl'], fontWeight: fontWeight.extraBold, color: colors.textPrimary, letterSpacing: -0.5 },
  trimLabel:   { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, marginTop: 2 },
  journalBtn:  { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  content:     { paddingHorizontal: spacing[5], gap: spacing[5], paddingTop: spacing[2] },
  sectionTitle: { marginBottom: spacing[3] },
});

const hero = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    padding: spacing[6], borderRadius: radius['3xl'], borderWidth: 1.5,
  },
  weekNum:   { fontSize: fontSize['4xl'], fontWeight: fontWeight.extraBold, letterSpacing: -2 },
  weekLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold },
  weekDay:   { fontSize: fontSize.xs, color: colors.textTertiary },
  right:     { alignItems: 'center', gap: spacing[1] },
  pct:       { fontSize: fontSize['3xl'], fontWeight: fontWeight.extraBold, color: colors.textPrimary, letterSpacing: -1 },
  pctLabel:  { fontSize: fontSize.xs, color: colors.textTertiary },
  dueDays:   { flexDirection: 'row', alignItems: 'baseline', gap: spacing[1], marginTop: spacing[2] },
  dueNum:    { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.textPrimary },
  dueLabel:  { fontSize: fontSize.sm, color: colors.textSecondary },
  dueDateText: { fontSize: fontSize.xs, color: colors.textTertiary },
});

const babyS = StyleSheet.create({
  card: { borderRadius: radius['2xl'], padding: spacing[5], borderWidth: 1.5, gap: spacing[2] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
  emoji: { fontSize: 32 },
  size:  { fontSize: fontSize.sm, color: colors.textSecondary },
  dev:   { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: fontSize.base * 1.6 },
  more:  { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, marginTop: spacing[1] },
});

const warnS = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3],
    backgroundColor: colors.warningLight, borderRadius: radius.xl,
    padding: spacing[4], borderWidth: 1.5, borderColor: colors.warning + '55',
  },
  icon: { fontSize: 20, flexShrink: 0, marginTop: 1 },
  text: { flex: 1, fontSize: fontSize.sm, color: colors.warningText, lineHeight: fontSize.sm * 1.6 },
});

const clS = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[5],
    ...shadows.sm, borderWidth: 1, borderColor: colors.borderLight, gap: spacing[3],
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:  { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary },
  pct:    { fontSize: fontSize.xl, fontWeight: fontWeight.extraBold },
  bar: {
    height: 8, backgroundColor: colors.borderLight, borderRadius: radius.full, overflow: 'hidden',
  },
  fill:   { height: '100%', borderRadius: radius.full },
  sub:    { fontSize: fontSize.xs, color: colors.textTertiary },
});
