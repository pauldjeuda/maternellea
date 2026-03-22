/**
 * features/postpartum/screens/PostpartumHomeScreen.tsx
 *
 * Dashboard post-partum. Sections:
 *   1. Hero bébé (accès carnet)
 *   2. Mon état du jour (ou CTA "Ajouter une entrée")
 *   3. Journal des 7 derniers jours (mini sparkline humeur)
 *   4. Prochain vaccin
 *   5. Raccourcis rapides
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { MOOD_EMOJIS, MOOD_LABELS, GENDER_EMOJIS, VACCINE_STATUS_LABELS } from '@constants';
import { fmtShort, dayLabel, daysUntil, todayISO } from '@utils/date';
import { usePostpartumData } from '../hooks/usePostpartumData';
import {
  BabyAvatarHeader, PostpartumEntryCard, SectionHeader, EmptyCard,
} from '../components/PostpartumUI';
import type { PostpartumNavProp } from '@types/navigation';
import { getBabyAge } from '@utils/date';

const { colors, spacing, radius, fontSize, fontWeight, shadows, palette } = tokens;

// ─── mood sparkline (last 7 days) ────────────────────────────

function MoodSparkline({ entries }: { entries: { date: string; mood: number }[] }) {
  const last7 = entries.slice(0, 7).reverse();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing[2] }}>
      {last7.map((e) => {
        const barPct = (e.mood / 5) * 100;
        const barColor =
          e.mood <= 2 ? palette.red400  :
          e.mood === 3 ? palette.amber400 :
          e.mood === 4 ? palette.sage400  : palette.green500;
        return (
          <View key={e.date} style={{ alignItems: 'center', gap: spacing[1], flex: 1 }}>
            <View style={{ width: '100%', height: 36, justifyContent: 'flex-end' }}>
              <View style={{
                height: `${barPct}%`, minHeight: 6,
                backgroundColor: barColor + 'CC',
                borderRadius: radius.xs,
              }} />
            </View>
            <Text style={{ fontSize: 8, color: colors.textTertiary }}>
              {fmtShort(e.date).split(' ')[0]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  SCREEN
// ─────────────────────────────────────────────────────────────

export function PostpartumHomeScreen() {
  const navigation = useNavigation<PostpartumNavProp>();
  const insets     = useSafeAreaInsets();
  const { baby, postpartum, todayEntry, recentMood, nextVaccine } = usePostpartumData();

  const babyAge = baby ? getBabyAge(baby.birthDate) : null;
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 700));
    setRefreshing(false);
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* ── HEADER ────────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Post-partum</Text>
          <Text style={s.subtitle}>Votre récupération · Carnet de bébé</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.phasePostpartum} />}
      >

        {/* ── BÉBÉ HERO ─────────────────────────────────── */}
        {baby && babyAge ? (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate('BabyDashboard', { babyId: baby.id })}
          >
            <BabyAvatarHeader baby={baby} babyAge={babyAge} />
            <Text style={s.babyHint}>Appuyez pour ouvrir le carnet de bébé →</Text>
          </TouchableOpacity>
        ) : (
          <EmptyCard emoji="👶" title="Ajoutez votre bébé" subtitle="Créez le profil de votre enfant pour commencer le suivi." />
        )}

        {/* ── MON ÉTAT DU JOUR ──────────────────────────── */}
        <View>
          <SectionHeader title="Mon état aujourd'hui" style={s.sectionTitle} />
          {todayEntry ? (
            <PostpartumEntryCard
              entry={todayEntry}
              onPress={() => navigation.navigate('AddPostpartumEntry', { entryId: todayEntry.id })}
            />
          ) : (
            <TouchableOpacity
              style={addS.cta}
              onPress={() => navigation.navigate('AddPostpartumEntry', {})}
              activeOpacity={0.86}
            >
              <Text style={addS.icon}>📝</Text>
              <View style={{ flex: 1 }}>
                <Text style={addS.title}>Comment vous sentez-vous ?</Text>
                <Text style={addS.sub}>Notez votre humeur, fatigue et symptômes du jour.</Text>
              </View>
              <Text style={[addS.btn, { color: colors.phasePostpartum }]}>Ajouter</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── HUMEUR DES 7 DERNIERS JOURS ──────────────── */}
        {postpartum.length >= 3 && (
          <View style={moodS.card}>
            <View style={moodS.header}>
              <Text style={moodS.title}>Votre humeur récente</Text>
              {recentMood !== null && (
                <Text style={[moodS.avg, { color: recentMood >= 4 ? colors.success : recentMood >= 3 ? colors.warning : colors.error }]}>
                  Moy. {recentMood}/5
                </Text>
              )}
            </View>
            <MoodSparkline entries={postpartum.slice(0, 7)} />
            <TouchableOpacity onPress={() => navigation.navigate('PostpartumJournal')} style={moodS.link}>
              <Text style={[moodS.linkText, { color: colors.phasePostpartum }]}>Voir le journal complet →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── PROCHAIN VACCIN ───────────────────────────── */}
        {nextVaccine && baby && (
          <View>
            <SectionHeader
              title="Prochain vaccin"
              actionLabel="Calendrier"
              onAction={() => navigation.navigate('VaccineCalendar', { babyId: baby.id })}
              style={s.sectionTitle}
            />
            <TouchableOpacity
              onPress={() => navigation.navigate('VaccineDetail', { recordId: nextVaccine.id, babyId: baby.id })}
              style={[vaccS.card, {
                borderColor: nextVaccine.status === 'due_soon' ? colors.warning + '55'
                           : nextVaccine.status === 'overdue'  ? colors.error + '55'
                           : colors.borderLight,
              }]}
              activeOpacity={0.86}
            >
              <View style={[vaccS.iconWrap, {
                backgroundColor: nextVaccine.status === 'due_soon' ? colors.warningLight
                               : nextVaccine.status === 'overdue'  ? colors.errorLight
                               : colors.surfaceAlt,
              }]}>
                <Text style={{ fontSize: 24 }}>💉</Text>
              </View>
              <View style={{ flex: 1, gap: spacing[0.5] }}>
                <Text style={vaccS.name} numberOfLines={2}>{nextVaccine.vaccine.name}</Text>
                <Text style={vaccS.meta}>{nextVaccine.vaccine.recommendedAgeLabel} · {nextVaccine.vaccine.diseases.slice(0,2).join(', ')}</Text>
                {nextVaccine.scheduledDate && (
                  <Text style={[vaccS.date, {
                    color: nextVaccine.status === 'due_soon' ? colors.warning
                         : nextVaccine.status === 'overdue'  ? colors.error
                         : colors.textTertiary,
                  }]}>
                    {nextVaccine.status === 'overdue'
                      ? `En retard — prévu le ${fmtShort(nextVaccine.scheduledDate)}`
                      : nextVaccine.status === 'due_soon'
                      ? `Bientôt — ${dayLabel(nextVaccine.scheduledDate)}`
                      : `Prévu ${dayLabel(nextVaccine.scheduledDate)}`}
                  </Text>
                )}
              </View>
              <View style={[vaccS.badge, {
                backgroundColor: nextVaccine.status === 'due_soon' ? colors.warningLight
                               : nextVaccine.status === 'overdue'  ? colors.errorLight
                               : colors.surfaceAlt,
              }]}>
                <Text style={[vaccS.badgeText, {
                  color: nextVaccine.status === 'due_soon' ? colors.warningText
                       : nextVaccine.status === 'overdue'  ? colors.errorText
                       : colors.textTertiary,
                }]}>
                  {VACCINE_STATUS_LABELS[nextVaccine.status]}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ── RACCOURCIS ────────────────────────────────── */}
        {baby && (
          <View>
            <SectionHeader title="Accès rapide" style={s.sectionTitle} />
            <View style={qS.grid}>
              {[
                { emoji: '📈', label: 'Croissance', route: 'GrowthTracking', params: { babyId: baby.id } },
                { emoji: '💉', label: 'Vaccins',    route: 'VaccineCalendar', params: { babyId: baby.id } },
                { emoji: '📓', label: 'Mon journal', route: 'PostpartumJournal', params: {} },
                { emoji: '📋', label: 'Notes santé', route: 'BabyDashboard', params: { babyId: baby.id } },
              ].map(({ emoji, label, route, params }) => (
                <TouchableOpacity
                  key={label}
                  onPress={() => navigation.navigate(route as any, params as any)}
                  style={qS.item}
                  activeOpacity={0.78}
                >
                  <View style={qS.iconWrap}>
                    <Text style={{ fontSize: 26 }}>{emoji}</Text>
                  </View>
                  <Text style={qS.label}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing[5], paddingTop: spacing[3], paddingBottom: spacing[4], backgroundColor: colors.background,
  },
  title:       { fontSize: fontSize['2xl'], fontWeight: fontWeight.extraBold, color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle:    { fontSize: fontSize.sm, color: colors.textTertiary, marginTop: 2 },
  content:     { paddingHorizontal: spacing[5], gap: spacing[5], paddingTop: spacing[2] },
  babyHint:    { fontSize: fontSize.xs, color: colors.phasePostpartum, fontWeight: fontWeight.medium, marginTop: spacing[2], textAlign: 'right' },
  sectionTitle: { marginBottom: spacing[3] },
});

const addS = StyleSheet.create({
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[4],
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[5],
    borderWidth: 1.5, borderColor: colors.phasePostpartum + '44',
    borderStyle: 'dashed',
  },
  icon:  { fontSize: 26 },
  title: { fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.textPrimary },
  sub:   { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  btn:   { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
});

const moodS = StyleSheet.create({
  card:   { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[5], gap: spacing[4], ...shadows.xs, borderWidth: 1, borderColor: colors.borderLight },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:  { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary },
  avg:    { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  link:   { alignSelf: 'flex-end', marginTop: spacing[1] },
  linkText: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold },
});

const vaccS = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[4], borderWidth: 1.5, ...shadows.xs },
  iconWrap:  { width: 44, height: 44, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  name:      { fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.textPrimary },
  meta:      { fontSize: fontSize.xs, color: colors.textTertiary },
  date:      { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold, marginTop: 2 },
  badge:     { borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: spacing[0.5], flexShrink: 0 },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },
});

const qS = StyleSheet.create({
  grid:    { flexDirection: 'row', gap: spacing[3] },
  item:    { flex: 1, alignItems: 'center', gap: spacing[2] },
  iconWrap: { width: 56, height: 56, borderRadius: radius.xl, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  label:   { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium, textAlign: 'center' },
});
