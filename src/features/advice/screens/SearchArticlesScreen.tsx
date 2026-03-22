/**
 * features/advice/screens/SearchArticlesScreen.tsx
 *
 * Recherche d'articles en temps réel.
 * - Barre de recherche auto-focus
 * - Résultats instantanés pendant la frappe
 * - Suggestions de tags populaires
 * - Dernier état vide : invitation à taper
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { useAdviceData } from '../hooks/useAdviceData';
import { ArticleCard, ArticleListEmpty } from '../components/AdviceUI';
import { CATEGORY_CONFIGS } from '../types';
import type { AdviceNavProp } from '@types/navigation';

const { colors, spacing, radius, fontSize, fontWeight } = tokens;

// ─────────────────────────────────────────────────────────────
//  POPULAR TAGS  (static curated list)
// ─────────────────────────────────────────────────────────────

const POPULAR_TAGS = [
  'grossesse', 'allaitement', 'ovulation', 'nutrition',
  'sommeil', 'yoga', 'nausées', 'bébé', 'fatigue',
  'bien-être', 'post-partum', 'hormones',
];

// ─────────────────────────────────────────────────────────────
//  SCREEN
// ─────────────────────────────────────────────────────────────

export function SearchArticlesScreen() {
  const navigation = useNavigation<AdviceNavProp>();
  const insets     = useSafeAreaInsets();
  const inputRef   = useRef<TextInput>(null);

  const { search, toggleFavorite, markRead, isRead } = useAdviceData();

  const [query, setQuery] = useState('');
  const trimmed = query.trim();

  const results = useMemo(() => search(trimmed), [trimmed]);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  function openArticle(id: string) {
    markRead(id);
    navigation.navigate('AdviceDetail', { articleId: id });
  }

  function applyTag(tag: string) {
    setQuery(tag);
  }

  const showResults    = trimmed.length > 0;
  const showEmpty      = showResults && results.length === 0;
  const showSuggestions = !showResults;

  return (
    <KeyboardAvoidingView
      style={[s.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >

      {/* ── SEARCH BAR ─────────────────────────────────── */}
      <View style={s.searchRow}>
        <View style={s.searchField}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un article, un sujet…"
            placeholderTextColor={colors.textTertiary}
            style={s.input}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Text style={{ fontSize: 16, color: colors.textTertiary }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.cancelBtn}>
          <Text style={s.cancelText}>Annuler</Text>
        </TouchableOpacity>
      </View>

      {/* ── SUGGESTIONS  ───────────────────────────────── */}
      {showSuggestions && (
        <View style={s.suggestions}>

          {/* Categories */}
          <Text style={s.suggestLabel}>Catégories</Text>
          <View style={s.catRow}>
            {CATEGORY_CONFIGS.map(c => (
              <TouchableOpacity
                key={c.key}
                onPress={() => setQuery(c.label.toLowerCase())}
                style={[s.catChip, { backgroundColor: c.bgColor, borderColor: c.color + '44' }]}
              >
                <Text style={{ fontSize: 14 }}>{c.emoji}</Text>
                <Text style={[s.catChipText, { color: c.color }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Popular tags */}
          <Text style={[s.suggestLabel, { marginTop: spacing[5] }]}>Sujets populaires</Text>
          <View style={s.tagsRow}>
            {POPULAR_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                onPress={() => applyTag(tag)}
                style={s.tagChip}
              >
                <Text style={s.tagText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ── EMPTY RESULTS ──────────────────────────────── */}
      {showEmpty && (
        <ArticleListEmpty
          emoji="🔍"
          title={`Aucun résultat pour "${trimmed}"`}
          subtitle="Essayez d'autres mots-clés ou parcourez les catégories."
        />
      )}

      {/* ── RESULTS LIST ───────────────────────────────── */}
      {showResults && !showEmpty && (
        <>
          <View style={s.resultsHeader}>
            <Text style={s.resultsCount}>
              {results.length} résultat{results.length !== 1 ? 's' : ''} pour "{trimmed}"
            </Text>
          </View>
          <FlatList
            data={results}
            keyExtractor={a => a.id}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <ArticleCard
                article={item}
                onPress={() => openArticle(item.id)}
                onFavoriteToggle={() => toggleFavorite(item.id)}
                isRead={isRead(item.id)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
          />
        </>
      )}

    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.background },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[5], paddingVertical: spacing[3],
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  searchField: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    backgroundColor: colors.surfaceAlt, borderRadius: radius['2xl'],
    paddingHorizontal: spacing[4], paddingVertical: spacing[2.5],
    borderWidth: 1, borderColor: colors.border,
  },
  input:       { flex: 1, fontSize: fontSize.base, color: colors.textPrimary },
  cancelBtn:   { },
  cancelText:  { fontSize: fontSize.base, color: colors.primary, fontWeight: fontWeight.medium },

  suggestions:  { padding: spacing[5] },
  suggestLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textTertiary, marginBottom: spacing[3], textTransform: 'uppercase', letterSpacing: 0.8 },
  catRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1.5],
    paddingVertical: spacing[2], paddingHorizontal: spacing[3],
    borderRadius: radius.full, borderWidth: 1.5,
  },
  catChipText:  { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold },
  tagsRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  tagChip: {
    backgroundColor: colors.surfaceAlt, borderRadius: radius.full,
    paddingHorizontal: spacing[3], paddingVertical: spacing[1.5],
    borderWidth: 1, borderColor: colors.border,
  },
  tagText: { fontSize: fontSize.sm, color: colors.textSecondary },

  resultsHeader: { paddingHorizontal: spacing[5], paddingVertical: spacing[3] },
  resultsCount:  { fontSize: fontSize.sm, color: colors.textTertiary, fontWeight: fontWeight.medium },
  list:          { paddingHorizontal: spacing[5], paddingBottom: spacing[12] },
});
