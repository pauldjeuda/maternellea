/**
 * features/vaccines/screens/VaccineHistoryScreen.tsx
 * Filterable history of all vaccine records.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { useVaccineData } from '../hooks/useVaccineData';
import { TimelineRow, StatsBar, SectionHeader, EmptyCard } from '../components/VaccineUI';
import { VACCINE_STATUS_CONFIG } from '../types';
import type { PostpartumStackParams, PostpartumNavProp } from '@types/navigation';
import type { VaccineStatus } from '@types/models';

const { colors, spacing, radius, fontSize, fontWeight } = tokens;
type Route = RouteProp<PostpartumStackParams, 'VaccineHistory'>;

const FILTERS: { key: VaccineStatus | 'all'; label: string }[] = [
  { key: 'all',      label: 'Tous' },
  { key: 'done',     label: '✅ Faits' },
  { key: 'overdue',  label: '⚠️ En retard' },
  { key: 'due_soon', label: '🔔 Bientôt' },
  { key: 'upcoming', label: '📅 À venir' },
];

export function VaccineHistoryScreen() {
  const navigation = useNavigation<PostpartumNavProp>();
  const route      = useRoute<Route>();
  const babyId     = route.params?.babyId;
  const { allStatuses, stats, baby } = useVaccineData(babyId);

  const [filter, setFilter] = useState<VaccineStatus | 'all'>('all');

  const filtered = useMemo(() => {
    const base = filter === 'all' ? allStatuses : allStatuses.filter(r => r.status === filter);
    return [...base].sort((a, b) => {
      // done: by administered date desc; others: by scheduled date
      if (a.isDone && b.isDone) {
        return (b.record?.administeredDate ?? '').localeCompare(a.record?.administeredDate ?? '');
      }
      return a.scheduledDate.localeCompare(b.scheduledDate);
    });
  }, [allStatuses, filter]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterBar}
        contentContainerStyle={{ paddingHorizontal: spacing[5], gap: spacing[2], paddingVertical: spacing[3] }}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key as any)}
            style={[s.chip, filter === f.key && s.chipActive]}
          >
            <Text style={[s.chipText, filter === f.key && s.chipTextActive]}>{f.label}</Text>
            {f.key !== 'all' && (
              <View style={s.chipCount}>
                <Text style={s.chipCountText}>
                  {f.key === 'done'     ? stats.done     :
                   f.key === 'overdue'  ? stats.overdue  :
                   f.key === 'due_soon' ? stats.dueSoon  :
                   stats.upcoming}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* Stats summary */}
        <StatsBar stats={stats} />

        {/* List */}
        {filtered.length > 0 ? (
          <View style={s.timeline}>
            {filtered.map((result, idx) => (
              <TimelineRow
                key={result.definition.id}
                result={result}
                isLast={idx === filtered.length - 1}
                onPress={() => navigation.navigate('VaccineDetail', {
                  recordId: result.record?.id ?? result.definition.id,
                  babyId:   babyId ?? baby?.id ?? '',
                })}
              />
            ))}
          </View>
        ) : (
          <EmptyCard
            emoji="🔍"
            title="Aucun vaccin trouvé"
            subtitle="Modifiez le filtre pour voir d'autres entrées."
          />
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  filterBar: { borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background },
  chip:      { flexDirection: 'row', alignItems: 'center', gap: spacing[1.5], paddingVertical: spacing[1.5], paddingHorizontal: spacing[3], borderRadius: radius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.border },
  chipActive: { backgroundColor: colors.fertileLight, borderColor: colors.fertile },
  chipText:  { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary },
  chipTextActive: { color: colors.fertile, fontWeight: fontWeight.semiBold },
  chipCount: { backgroundColor: colors.border, borderRadius: radius.full, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  chipCountText: { fontSize: fontSize['2xs'], fontWeight: fontWeight.bold, color: colors.textSecondary },
  content:   { padding: spacing[5], gap: spacing[5], paddingBottom: spacing[12] },
  timeline:  { gap: 0 },
});
