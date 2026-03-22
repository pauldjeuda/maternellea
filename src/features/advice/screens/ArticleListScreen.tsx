/**
 * features/advice/screens/ArticleListScreen.tsx
 *
 * Liste complète des articles avec filtre catégorie horizontal.
 * Reçoit un filtre optionnel en param (deep-link depuis TipsHomeScreen).
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokens } from '@theme/tokens';
import { useAdviceData } from '../hooks/useAdviceData';
import {
  ArticleCard, CategoryChip, SectionHeader, ArticleListEmpty,
} from '../components/AdviceUI';
import { CATEGORY_CONFIGS } from '../types';
import type { ArticleFilter } from '../types';
import type { AdviceNavProp } from '@types/navigation';

const { colors, spacing, radius, fontSize, fontWeight } = tokens;

// ─────────────────────────────────────────────────────────────
//  SORT OPTIONS
// ─────────────────────────────────────────────────────────────

type SortKey = 'recent' | 'read_time' | 'category';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent',    label: 'Plus récents' },
  { key: 'read_time', label: 'Lecture courte' },
  { key: 'category',  label: 'Catégorie' },
];

// ─────────────────────────────────────────────────────────────
//  SCREEN
// ─────────────────────────────────────────────────────────────

export function ArticleListScreen() {
  const navigation = useNavigation<AdviceNavProp>();
  const insets     = useSafeAreaInsets();
  const route      = useRoute<any>();

  const { allArticles, favoriteArticles, filter, toggleFavorite, markRead, isRead } = useAdviceData();

  const [activeFilter, setActiveFilter] = useState<ArticleFilter>(
    route.params?.category ?? 'all',
  );
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [showSort, setShowSort] = useState(false);

  const articles = useMemo(() => {
    const base = filter(activeFilter);
    switch (sortKey) {
      case 'recent':
        return [...base].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      case 'read_time':
        return [...base].sort((a, b) => a.readTimeMinutes - b.readTimeMinutes);
      case 'category':
        return [...base].sort((a, b) => a.category.localeCompare(b.category));
      default:
        return base;
    }
  }, [activeFilter, sortKey, allArticles]);

  function openArticle(id: string) {
    markRead(id);
    navigation.navigate('AdviceDetail', { articleId: id });
  }

  const activeLabel = activeFilter === 'all'       ? 'Tous les articles' :
                      activeFilter === 'favorites'  ? 'Mes favoris' :
                      CATEGORY_CONFIGS.find(c => c.key === activeFilter)?.label ?? 'Articles';

  const ALL_FILTERS: { key: ArticleFilter; label: string; emoji: string }[] = [
    { key: 'all',       label: 'Tous',        emoji: '📚' },
    { key: 'favorites', label: 'Favoris',     emoji: '❤️' },
    ...CATEGORY_CONFIGS.map(c => ({ key: c.key as ArticleFilter, label: c.label, emoji: c.emoji })),
  ];

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.navigate('AdviceSearch')} style={s.searchPill}>
          <Text style={{ fontSize: 14, color: colors.textTertiary }}>🔍</Text>
          <Text style={s.searchText}>Rechercher…</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.sortBtn, showSort && s.sortBtnActive]}
          onPress={() => setShowSort(v => !v)}
        >
          <Text style={[s.sortBtnText, showSort && { color: colors.primary }]}>
            Trier {showSort ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort popup */}
      {showSort && (
        <View style={s.sortMenu}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => { setSortKey(opt.key); setShowSort(false); }}
              style={[s.sortOpt, sortKey === opt.key && s.sortOptActive]}
            >
              <Text style={[s.sortOptText, sortKey === opt.key && { color: colors.primary, fontWeight: fontWeight.semiBold }]}>
                {sortKey === opt.key ? '✓ ' : ''}{opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── FILTER BAR ─────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterBar}
        contentContainerStyle={s.filterRow}
      >
        {ALL_FILTERS.map(f => {
          const catCfg = CATEGORY_CONFIGS.find(c => c.key === f.key);
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[
                s.filterChip,
                isActive && {
                  backgroundColor: catCfg ? catCfg.color : colors.primary,
                  borderColor:     catCfg ? catCfg.color : colors.primary,
                },
              ]}
            >
              <Text style={s.filterEmoji}>{f.emoji}</Text>
              <Text style={[s.filterLabel, isActive && { color: colors.textInverse, fontWeight: fontWeight.semiBold }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── LIST ───────────────────────────────────────── */}
      <FlatList
        data={articles}
        keyExtractor={a => a.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={s.listHeader}>
            <Text style={s.listTitle}>{activeLabel}</Text>
            <Text style={s.listCount}>{articles.length} article{articles.length !== 1 ? 's' : ''}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            onPress={() => openArticle(item.id)}
            onFavoriteToggle={() => toggleFavorite(item.id)}
            isRead={isRead(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
        ListEmptyComponent={() => (
          <ArticleListEmpty
            emoji={activeFilter === 'favorites' ? '❤️' : '📭'}
            title={activeFilter === 'favorites' ? 'Aucun favori' : 'Aucun article'}
            subtitle={
              activeFilter === 'favorites'
                ? 'Appuyez sur ❤️ sur un article pour l\'ajouter à vos favoris.'
                : 'Essayez un autre filtre.'
            }
          />
        )}
      />

    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[5], paddingVertical: spacing[3],
  },
  searchPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    backgroundColor: colors.surfaceAlt, borderRadius: radius.full,
    paddingVertical: spacing[2.5], paddingHorizontal: spacing[4],
    borderWidth: 1, borderColor: colors.border,
  },
  searchText:    { fontSize: fontSize.sm, color: colors.textTertiary, flex: 1 },
  sortBtn:       { paddingVertical: spacing[2], paddingHorizontal: spacing[3], borderRadius: radius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  sortBtnActive: { borderColor: colors.primary },
  sortBtnText:   { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  sortMenu:      { marginHorizontal: spacing[5], backgroundColor: colors.surface, borderRadius: radius.xl, ...{elevation: 4, shadowColor: '#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.1, shadowRadius:8}, borderWidth: 1, borderColor: colors.borderLight, overflow: 'hidden', marginBottom: spacing[2] },
  sortOpt:       { paddingVertical: spacing[3.5], paddingHorizontal: spacing[5], borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  sortOptActive: { backgroundColor: colors.primarySubtle },
  sortOptText:   { fontSize: fontSize.base, color: colors.textPrimary },
  filterBar: { borderBottomWidth: 1, borderBottomColor: colors.border, flexGrow: 0 },
  filterRow: { paddingHorizontal: spacing[5], paddingVertical: spacing[3], gap: spacing[2] },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1.5],
    paddingVertical: spacing[1.5], paddingHorizontal: spacing[3],
    borderRadius: radius.full, borderWidth: 1.5,
    backgroundColor: colors.surfaceAlt, borderColor: colors.border,
  },
  filterEmoji:  { fontSize: 13 },
  filterLabel:  { fontSize: fontSize.sm, color: colors.textSecondary },
  listHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] },
  listTitle:    { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  listCount:    { fontSize: fontSize.sm, color: colors.textTertiary },
  listContent:  { padding: spacing[5], paddingBottom: spacing[12] },
});
