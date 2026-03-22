/**
 * features/cycle/screens/CycleDashboardScreen.tsx
 *
 * Entry point of the Cycle tab.
 * Shows:
 *   - Phase du jour (hero)
 *   - Prochaines règles + fenêtre fertile
 *   - Stats rapides
 *   - Entrées récentes (symptômes)
 *   - FAB ajouter une entrée
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { fmtShort, dayLabel, daysUntil, todayISO } from '@utils/date';
import { useCycleData } from '../hooks/useCycleData';
import { SymptomEntryCard, SectionHeader, EmptyState } from '../components/CycleUI';
import type { CycleNavProp } from '@types/navigation';

const { colors, spacing, radius, fontSize, fontWeight, shadows, palette } = tokens;

// ─────────────────────────────────────────────────────────────
//  STAT MINI CARD
// ─────────────────────────────────────────────────────────────

function MiniStat({ label, value, emoji, accent }: {
  label: string; value: string; emoji: string; accent: string;
}) {
  return (
    <View style={[miniS.card, { borderColor: accent + '33' }]}>
      <Text style={miniS.emoji}>{emoji}</Text>
      <Text style={[miniS.value, { color: accent }]}>{value}</Text>
      <Text style={miniS.label}>{label}</Text>
    </View>
  );
}

const miniS = StyleSheet.create({
  card: {
    flex:            1,
    alignItems:      'center',
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    borderRadius:    radius.xl,
    borderWidth:     1.5,
    gap:             spacing[1],
    ...shadows.xs,
  },
  emoji: { fontSize: 22 },
  value: { fontSize: fontSize.xl, fontWeight: fontWeight.extraBold },
  label: { fontSize: fontSize.xs, color: colors.textTertiary, fontWeight: fontWeight.medium, textAlign: 'center' },
});

// ─────────────────────────────────────────────────────────────
//  SCREEN
// ─────────────────────────────────────────────────────────────

export function CycleDashboardScreen() {
  const navigation = useNavigation<CycleNavProp>();
  const insets     = useSafeAreaInsets();
  const { prediction, stats, todayStatus, sortedSymptoms } = useCycleData();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 700));
    setRefreshing(false);
  }

  const daysLeft = prediction ? daysUntil(prediction.nextPeriodStart) : null;

  return (
    <View style={[screen.root, { paddingTop: insets.top }]}>

      {/* ── HEADER ───────────────────────────────────────── */}
      <View style={screen.header}>
        <View>
          <Text style={screen.title}>Mon cycle</Text>
          <Text style={screen.subtitle}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <TouchableOpacity
          style={screen.calBtn}
          onPress={() => navigation.navigate('CycleHistory')}
        >
          <Text style={{ fontSize: 22 }}>📋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[screen.content, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >

        {/* ── HERO : Phase du jour ─────────────────────── */}
        <View style={[hero.card, { backgroundColor: todayStatus.accent + '15', borderColor: todayStatus.accent + '33' }]}>
          <View style={[hero.iconWrap, { backgroundColor: todayStatus.accent + '22' }]}>
            <Text style={hero.icon}>{todayStatus.emoji}</Text>
          </View>
          <View style={hero.text}>
            <Text style={[hero.phase, { color: todayStatus.accent }]}>Phase actuelle</Text>
            <Text style={hero.label}>{todayStatus.label}</Text>
          </View>
        </View>

        {/* ── PRÉDICTION ───────────────────────────────── */}
        {prediction && (
          <View style={pred.card}>
            <View style={pred.row}>
              {/* Prochaines règles */}
              <View style={[pred.item, { borderColor: colors.phaseCycle + '44' }]}>
                <Text style={pred.itemLabel}>Prochaines règles</Text>
                <Text style={[pred.itemValue, { color: colors.phaseCycle }]}>
                  {daysLeft === 0 ? 'Aujourd\'hui' :
                   daysLeft === 1 ? 'Demain' :
                   `J − ${daysLeft}`}
                </Text>
                <Text style={pred.itemSub}>
                  {fmtShort(prediction.nextPeriodStart)} – {fmtShort(prediction.nextPeriodEnd)}
                </Text>
              </View>

              {/* Ovulation */}
              <View style={[pred.item, { borderColor: colors.fertile + '44' }]}>
                <Text style={pred.itemLabel}>Ovulation estimée</Text>
                <Text style={[pred.itemValue, { color: colors.fertile }]}>
                  {dayLabel(prediction.ovulationDate)}
                </Text>
                <Text style={pred.itemSub}>
                  Fertile : {fmtShort(prediction.fertileWindowStart)} – {fmtShort(prediction.fertileWindowEnd)}
                </Text>
              </View>
            </View>

            {/* Confidence */}
            <View style={pred.confidence}>
              <View style={[pred.confDot, {
                backgroundColor:
                  prediction.confidence === 'high'   ? colors.success :
                  prediction.confidence === 'medium' ? colors.warning  : colors.textTertiary,
              }]} />
              <Text style={pred.confText}>
                {prediction.confidence === 'high'   ? 'Haute précision' :
                 prediction.confidence === 'medium' ? 'Précision moyenne' : 'Peu de données — ajoutez des cycles'}
              </Text>
            </View>
          </View>
        )}

        {/* ── STATS RAPIDES ────────────────────────────── */}
        {stats.totalCycles > 0 && (
          <View>
            <SectionHeader title="Statistiques" style={screen.sectionTitle} />
            <View style={{ flexDirection: 'row', gap: spacing[3] }}>
              <MiniStat
                emoji="📅" label="Cycle moyen"
                value={`${stats.averageCycleLength} j`}
                accent={colors.phaseCycle}
              />
              <MiniStat
                emoji="🩸" label="Règles moy."
                value={`${stats.averagePeriodLength} j`}
                accent={colors.secondary}
              />
              <MiniStat
                emoji="⚖️" label="Régularité"
                value={`${stats.regularityScore}%`}
                accent={colors.fertile}
              />
            </View>
          </View>
        )}

        {/* ── SYMPTÔMES RÉCENTS ────────────────────────── */}
        <View>
          <SectionHeader
            title="Journal récent"
            actionLabel="Tout voir"
            onAction={() => navigation.navigate('CycleHistory')}
            style={screen.sectionTitle}
          />
          {sortedSymptoms.length > 0 ? (
            <View style={{ gap: spacing[3] }}>
              {sortedSymptoms.slice(0, 3).map(entry => (
                <SymptomEntryCard
                  key={entry.id}
                  entry={entry}
                  onPress={() => navigation.navigate('AddSymptoms', { date: entry.date })}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              emoji="📝"
              title="Aucune entrée"
              subtitle="Notez vos symptômes quotidiens pour un suivi précis."
            />
          )}
        </View>

      </ScrollView>

      {/* ── FAB ──────────────────────────────────────────── */}
      <TouchableOpacity
        style={[fab.btn, { bottom: insets.bottom + spacing[6] }]}
        onPress={() => navigation.navigate('AddPeriod', {})}
        activeOpacity={0.88}
      >
        <Text style={fab.icon}>＋</Text>
        <Text style={fab.label}>Ajouter</Text>
      </TouchableOpacity>

    </View>
  );
}

const screen = StyleSheet.create({
  root:         { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: spacing[5],
    paddingTop:        spacing[3],
    paddingBottom:     spacing[4],
    backgroundColor:   colors.background,
  },
  title:        { fontSize: fontSize['2xl'], fontWeight: fontWeight.extraBold, color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle:     { fontSize: fontSize.sm, color: colors.textTertiary, textTransform: 'capitalize', marginTop: 2 },
  calBtn:       { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  content:      { paddingHorizontal: spacing[5], gap: spacing[5], paddingTop: spacing[2] },
  sectionTitle: { marginBottom: spacing[3] },
});

const hero = StyleSheet.create({
  card: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing[4],
    padding:           spacing[5],
    borderRadius:      radius['2xl'],
    borderWidth:       1.5,
  },
  iconWrap:  { width: 54, height: 54, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  icon:      { fontSize: 28 },
  text:      { flex: 1, gap: spacing[1] },
  phase:     { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold, letterSpacing: 0.5, textTransform: 'uppercase' },
  label:     { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, lineHeight: fontSize.lg * 1.3 },
});

const pred = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius:    radius['2xl'],
    padding:         spacing[5],
    gap:             spacing[4],
    ...shadows.sm,
    borderWidth:     1,
    borderColor:     colors.borderLight,
  },
  row:          { flexDirection: 'row', gap: spacing[3] },
  item: {
    flex:              1,
    borderRadius:      radius.xl,
    padding:           spacing[4],
    borderWidth:       1.5,
    gap:               spacing[1],
  },
  itemLabel:    { fontSize: fontSize.xs, color: colors.textTertiary, fontWeight: fontWeight.medium },
  itemValue:    { fontSize: fontSize.xl, fontWeight: fontWeight.extraBold },
  itemSub:      { fontSize: fontSize.xs, color: colors.textTertiary },
  confidence:   { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  confDot:      { width: 8, height: 8, borderRadius: 4 },
  confText:     { fontSize: fontSize.xs, color: colors.textSecondary },
});

const fab = StyleSheet.create({
  btn: {
    position:        'absolute',
    right:           spacing[5],
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing[2],
    backgroundColor: colors.primary,
    borderRadius:    radius.full,
    paddingVertical:   spacing[3.5],
    paddingHorizontal: spacing[6],
    ...shadows.colored,
  },
  icon:  { fontSize: 20, color: colors.textInverse, fontWeight: fontWeight.bold },
  label: { fontSize: fontSize.base, color: colors.textInverse, fontWeight: fontWeight.semiBold },
});
