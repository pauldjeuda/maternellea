/**
 * features/advice/screens/TipsHomeScreen.tsx
 *
 * Écran d'accueil Conseils.
 * Sections :
 *   1. Header + barre de recherche
 *   2. Carrousel des articles mis en avant
 *   3. Grille catégories
 *   4. "Pour vous" — articles liés à la phase active
 *   5. Récemment publiés
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, RefreshControl, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { useAuthStore, selectActivePhase } from '@store/authStore';
import { useAdviceData } from '../hooks/useAdviceData';
import {
  ArticleCardHero, ArticleCard, CategoryCard,
  SectionHeader, ArticleListEmpty,
} from '../components/AdviceUI';
import { CATEGORY_CONFIGS } from '../types';
import type { AdviceNavProp } from '@types/navigation';

const { colors, spacing, radius, fontSize, fontWeight, shadows } = tokens;
const SCREEN_W = Dimensions.get('window').width;

// ─────────────────────────────────────────────────────────────
//  SCREEN
// ─────────────────────────────────────────────────────────────

export function TipsHomeScreen() {
  const navigation  = useNavigation<AdviceNavProp>();
  const insets      = useSafeAreaInsets();
  const activePhase = useAuthStore(selectActivePhase);
  const { featured, phaseArticles, allArticles, toggleFavorite, markRead, isRead } = useAdviceData();

  const [refreshing, setRefreshing] = useState(false);
  const [heroIndex, setHeroIndex]   = useState(0);

  async function onRefresh() {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 600));
    setRefreshing(false);
  }

  function openArticle(id: string) {
    markRead(id);
    navigation.navigate('AdviceDetail', { articleId: id });
  }

  const phaseLabel =
    activePhase === 'pregnancy'  ? 'grossesse' :
    activePhase === 'postpartum' ? 'post-partum' : 'cycle';

  const recentArticles = [...allArticles]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 6);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Conseils</Text>
          <Text style={s.subtitle}>Articles, guides et bien-être</Text>
        </View>
        <TouchableOpacity
          style={s.searchBtn}
          onPress={() => navigation.navigate('AdviceSearch')}
        >
          <Text style={{ fontSize: 18 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >

        {/* ── SEARCH BAR ────────────────────────────────── */}
        <TouchableOpacity
          style={s.searchBar}
          onPress={() => navigation.navigate('AdviceSearch')}
          activeOpacity={0.9}
        >
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <Text style={s.searchPlaceholder}>Rechercher un article, un sujet…</Text>
        </TouchableOpacity>

        {/* ── FEATURED CAROUSEL ─────────────────────────── */}
        {featured.length > 0 && (
          <View>
            <SectionHeader title="À la une" style={s.sectionTitle} />
            <FlatList
              data={featured}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToAlignment="start"
              decelerationRate="fast"
              snapToInterval={SCREEN_W - spacing[5] * 2 + spacing[3]}
              contentContainerStyle={{ paddingHorizontal: spacing[5], gap: spacing[3] }}
              keyExtractor={a => a.id}
              renderItem={({ item }) => (
                <View style={{ width: SCREEN_W - spacing[5] * 2 }}>
                  <ArticleCardHero
                    article={item}
                    onPress={() => openArticle(item.id)}
                    onFavoriteToggle={() => toggleFavorite(item.id)}
                  />
                </View>
              )}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_W - spacing[5] * 2 + spacing[3]));
                setHeroIndex(idx);
              }}
            />
            {/* Dots */}
            {featured.length > 1 && (
              <View style={s.dots}>
                {featured.map((_, i) => (
                  <View
                    key={i}
                    style={[s.dot, i === heroIndex && s.dotActive]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── CATÉGORIES ────────────────────────────────── */}
        <View>
          <SectionHeader
            title="Catégories"
            actionLabel="Tout voir"
            onAction={() => {}} // placeholder — categories screen is inline via AdviceList
            style={s.sectionTitle}
          />
          {/* 2-column grid */}
          <View style={s.categoryGrid}>
            {CATEGORY_CONFIGS.map(config => (
              <CategoryCard
                key={config.key}
                config={config}
                count={allArticles.filter(a => a.category === config.key).length}
                onPress={() => navigation.navigate('AdviceList', { category: config.key } as any)}
                style={s.categoryCell}
              />
            ))}
          </View>
        </View>

        {/* ── POUR VOUS ─────────────────────────────────── */}
        {phaseArticles.length > 0 && (
          <View>
            <SectionHeader
              title={`Pour votre ${phaseLabel}`}
              actionLabel="Voir tout"
              onAction={() => navigation.navigate('AdviceList', { forPhase: true } as any)}
              style={s.sectionTitle}
            />
            <View style={s.articleList}>
              {phaseArticles.slice(0, 4).map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onPress={() => openArticle(article.id)}
                  onFavoriteToggle={() => toggleFavorite(article.id)}
                  isRead={isRead(article.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── RÉCENTS ───────────────────────────────────── */}
        <View>
          <SectionHeader
            title="Articles récents"
            actionLabel="Tous les articles"
            onAction={() => navigation.navigate('AdviceList', {}  as any)}
            style={s.sectionTitle}
          />
          <View style={s.articleList}>
            {recentArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onPress={() => openArticle(article.id)}
                onFavoriteToggle={() => toggleFavorite(article.id)}
                isRead={isRead(article.id)}
              />
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[5], paddingTop: spacing[3], paddingBottom: spacing[2],
    backgroundColor: colors.background,
  },
  title:       { fontSize: fontSize['2xl'], fontWeight: fontWeight.extraBold, color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle:    { fontSize: fontSize.sm, color: colors.textTertiary, marginTop: 2 },
  searchBtn:   { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    backgroundColor: colors.surfaceAlt, borderRadius: radius['2xl'],
    padding: spacing[4], marginHorizontal: spacing[5],
    borderWidth: 1.5, borderColor: colors.border,
  },
  searchPlaceholder: { fontSize: fontSize.base, color: colors.textTertiary, flex: 1 },
  scroll:        { gap: spacing[6], paddingTop: spacing[3] },
  sectionTitle:  { marginBottom: spacing[3], paddingHorizontal: spacing[5] },
  dots:          { flexDirection: 'row', justifyContent: 'center', gap: spacing[1.5], marginTop: spacing[3] },
  dot:           { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive:     { backgroundColor: colors.primary, width: 16 },
  categoryGrid:  { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing[5], gap: spacing[3] },
  categoryCell:  { width: '47%' },
  articleList:   { paddingHorizontal: spacing[5], gap: spacing[3] },
});
