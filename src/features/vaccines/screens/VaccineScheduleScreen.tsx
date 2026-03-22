/**
 * features/vaccines/screens/VaccineScheduleScreen.tsx
 *
 * Main vaccine calendar — grouped by series, collapsible.
 * Shows overall progress at top, then series groups.
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { useVaccineData } from '../hooks/useVaccineData';
import {
  StatsBar, VaccineGroupHeader, VaccineCard,
  SectionHeader, EmptyCard,
} from '../components/VaccineUI';
import type { PostpartumStackParams, PostpartumNavProp } from '@types/navigation';

const { colors, spacing, radius, fontSize, fontWeight, shadows } = tokens;
type Route = RouteProp<PostpartumStackParams, 'VaccineCalendar'>;

export function VaccineScheduleScreen() {
  const route      = useRoute<Route>();
  const navigation = useNavigation<PostpartumNavProp>();
  const insets     = useSafeAreaInsets();
  const babyId     = route.params?.babyId;

  const { baby, groups, stats, upcoming, schedule, allStatuses } = useVaccineData(babyId);
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(
    () => new Set(groups.filter(g => !g.allDone).map(g => g.seriesName))
  );
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<'groups' | 'list'>('groups');

  function toggleSeries(name: string) {
    setExpandedSeries(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  async function onRefresh() {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 600));
    setRefreshing(false);
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Vaccins</Text>
          {baby && (
            <Text style={s.subtitle}>
              {baby.name} · {schedule.countryName} {schedule.scheduleYear}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={s.histBtn}
          onPress={() => navigation.navigate('VaccineHistory', { babyId: babyId ?? baby?.id ?? '' })}
        >
          <Text style={{ fontSize: 18 }}>📋</Text>
        </TouchableOpacity>
      </View>

      {/* ── VIEW TOGGLE ────────────────────────────────── */}
      <View style={s.toggle}>
        {(['groups', 'list'] as const).map(v => (
          <TouchableOpacity
            key={v}
            onPress={() => setView(v)}
            style={[s.toggleBtn, view === v && s.toggleBtnActive]}
          >
            <Text style={[s.toggleLabel, view === v && s.toggleLabelActive]}>
              {v === 'groups' ? 'Par série' : 'Tous'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.fertile} />}
      >

        {/* ── STATS BAR ─────────────────────────────────── */}
        <StatsBar stats={stats} />

        {/* ── NEXT DUE ──────────────────────────────────── */}
        {stats.nextDue && (
          <View>
            <SectionHeader title="Prochain vaccin" style={s.sectionTitle} />
            <VaccineCard
              result={stats.nextDue}
              onPress={() => navigation.navigate('VaccineDetail', {
                recordId: stats.nextDue!.record?.id ?? stats.nextDue!.definition.id,
                babyId:   babyId ?? baby?.id ?? '',
              })}
            />
          </View>
        )}

        {/* ── GROUPED VIEW ──────────────────────────────── */}
        {view === 'groups' && groups.length > 0 && (
          <View>
            <SectionHeader title="Calendrier complet" style={s.sectionTitle} />
            <View style={{ gap: spacing[3] }}>
              {groups.map(group => (
                <View key={group.seriesName}>
                  <VaccineGroupHeader
                    group={group}
                    expanded={expandedSeries.has(group.seriesName)}
                    onToggle={() => toggleSeries(group.seriesName)}
                  />
                  {expandedSeries.has(group.seriesName) && (
                    <View style={s.expandedItems}>
                      {group.definitions.map(result => (
                        <VaccineCard
                          key={result.definition.id}
                          result={result}
                          compact
                          onPress={() => navigation.navigate('VaccineDetail', {
                            recordId: result.record?.id ?? result.definition.id,
                            babyId:   babyId ?? baby?.id ?? '',
                          })}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── FLAT LIST VIEW ────────────────────────────── */}
        {view === 'list' && (
          <View>
            <SectionHeader title={`${allStatuses.length} vaccins`} style={s.sectionTitle} />
            {allStatuses.length > 0 ? (
              <View style={{ gap: spacing[3] }}>
                {allStatuses.map(result => (
                  <VaccineCard
                    key={result.definition.id}
                    result={result}
                    onPress={() => navigation.navigate('VaccineDetail', {
                      recordId: result.record?.id ?? result.definition.id,
                      babyId:   babyId ?? baby?.id ?? '',
                    })}
                  />
                ))}
              </View>
            ) : (
              <EmptyCard emoji="💉" title="Aucun vaccin trouvé" />
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[5], paddingTop: spacing[3], paddingBottom: spacing[3],
    backgroundColor: colors.background,
  },
  title:       { fontSize: fontSize['2xl'], fontWeight: fontWeight.extraBold, color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle:    { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 },
  histBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.fertileLight, alignItems: 'center', justifyContent: 'center' },
  toggle: {
    flexDirection: 'row', marginHorizontal: spacing[5], marginBottom: spacing[3],
    backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing[0.5],
    borderWidth: 1, borderColor: colors.border,
  },
  toggleBtn: { flex: 1, paddingVertical: spacing[2], alignItems: 'center', borderRadius: radius.md },
  toggleBtnActive: { backgroundColor: colors.surface, ...shadows.xs },
  toggleLabel: { fontSize: fontSize.sm, color: colors.textTertiary, fontWeight: fontWeight.medium },
  toggleLabelActive: { color: colors.textPrimary, fontWeight: fontWeight.semiBold },
  content:      { paddingHorizontal: spacing[5], gap: spacing[5], paddingTop: spacing[1] },
  sectionTitle: { marginBottom: spacing[3] },
  expandedItems: { marginTop: spacing[2], marginLeft: spacing[5], gap: spacing[2] },
});
