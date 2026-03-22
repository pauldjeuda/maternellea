/**
 * features/postpartum/screens/PostpartumJournalScreen.tsx
 * Complete journal history with filter by mood.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { MOOD_EMOJIS, MOOD_LABELS } from '@constants';
import { usePostpartumData } from '../hooks/usePostpartumData';
import { PostpartumEntryCard, EmptyCard } from '../components/PostpartumUI';
import type { PostpartumNavProp } from '@types/navigation';

const { colors, spacing, radius, fontSize, fontWeight } = tokens;

export function PostpartumJournalScreen() {
  const navigation = useNavigation<PostpartumNavProp>();
  const { postpartum } = usePostpartumData();
  const [filter, setFilter] = useState<number | null>(null);

  const filtered = useMemo(
    () => filter ? postpartum.filter(e => e.mood === filter) : postpartum,
    [postpartum, filter],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Filter bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterBar} contentContainerStyle={{ paddingHorizontal: spacing[5], gap: spacing[2], paddingVertical: spacing[3] }}>
        <TouchableOpacity
          onPress={() => setFilter(null)}
          style={[s.filterChip, !filter && s.filterChipActive]}
        >
          <Text style={[s.filterText, !filter && { color: colors.textInverse }]}>Toutes</Text>
        </TouchableOpacity>
        {[1,2,3,4,5].map(m => (
          <TouchableOpacity
            key={m}
            onPress={() => setFilter(filter === m ? null : m)}
            style={[s.filterChip, filter === m && s.filterChipActive]}
          >
            <Text style={{ fontSize: 16 }}>{MOOD_EMOJIS[m]}</Text>
            <Text style={[s.filterText, filter === m && { color: colors.textInverse }]}>{MOOD_LABELS[m]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {filtered.length > 0 ? (
          filtered.map(entry => (
            <PostpartumEntryCard
              key={entry.id}
              entry={entry}
              onPress={() => navigation.navigate('AddPostpartumEntry', { entryId: entry.id })}
            />
          ))
        ) : (
          <EmptyCard
            emoji="📓"
            title="Aucune entrée"
            subtitle={filter ? "Aucune entrée avec ce filtre." : "Commencez à noter votre quotidien."}
            actionLabel="Ajouter une entrée"
            onAction={() => navigation.navigate('AddPostpartumEntry', {})}
          />
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  filterBar: { borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: spacing[1.5], paddingVertical: spacing[1.5], paddingHorizontal: spacing[3], borderRadius: radius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.phasePostpartum, borderColor: colors.phasePostpartum },
  filterText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary },
  content: { padding: spacing[5], gap: spacing[3], paddingBottom: spacing[12] },
});
