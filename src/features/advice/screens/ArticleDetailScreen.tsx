/**
 * features/advice/screens/ArticleDetailScreen.tsx
 *
 * Lecteur d'article complet.
 * - Header sticky avec titre tronqué au scroll
 * - Barre de progression de lecture
 * - Corps rendu via ContentRenderer (blocks structurés)
 * - Tags, auteur, date
 * - Articles associés
 * - Bouton favori
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { fmt } from '@utils/date';
import { useAdviceData } from '../hooks/useAdviceData';
import {
  FavoriteBadge, ReadTimeBadge, ContentRenderer,
  ArticleCardCompact, SectionHeader,
} from '../components/AdviceUI';
import { parseContent } from '../types';
import type { AdviceStackParams, AdviceNavProp } from '@types/navigation';

const { colors, spacing, radius, fontSize, fontWeight, shadows } = tokens;
const SCREEN_H = Dimensions.get('window').height;

type Route = RouteProp<AdviceStackParams, 'AdviceDetail'>;

export function ArticleDetailScreen() {
  const navigation = useNavigation<AdviceNavProp>();
  const route      = useRoute<Route>();
  const insets     = useSafeAreaInsets();
  const { articleId } = route.params;

  const { getById, getRelated, toggleFavorite, markRead, isRead } = useAdviceData();
  const article  = getById(articleId);
  const related  = getRelated(articleId, 3);
  const blocks   = article ? parseContent(article.content) : [];

  const scrollY       = useRef(new Animated.Value(0)).current;
  const [readPct, setReadPct] = useState(0);
  const contentHeight = useRef(0);
  const scrollHeight  = useRef(0);

  // Mark as read once opened
  React.useEffect(() => {
    if (articleId) markRead(articleId);
  }, [articleId]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  function handleScroll(e: any) {
    const offset    = e.nativeEvent.contentOffset.y;
    const totalH    = e.nativeEvent.contentSize.height;
    const viewH     = e.nativeEvent.layoutMeasurement.height;
    const scrollable = Math.max(1, totalH - viewH);
    setReadPct(Math.min(100, Math.round((offset / scrollable) * 100)));
    scrollY.setValue(offset);
  }

  if (!article) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <Text style={{ fontSize: 40 }}>🔍</Text>
        <Text style={{ fontSize: fontSize.lg, color: colors.textSecondary, marginTop: spacing[3] }}>
          Article introuvable
        </Text>
      </View>
    );
  }

  const { categoryConfig: cc } = article;

  return (
    <View style={[s.root]}>

      {/* ── STICKY HEADER (animated) ──────────────────── */}
      <Animated.View style={[s.stickyHeader, { opacity: headerOpacity, paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={8}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.stickyTitle} numberOfLines={1}>{article.title}</Text>
        <FavoriteBadge isFavorite={article.isFavorite} onPress={() => toggleFavorite(article.id)} size={34} />
      </Animated.View>

      {/* ── READ PROGRESS BAR ─────────────────────────── */}
      <View style={s.progressTrack}>
        <Animated.View style={[s.progressFill, { width: `${readPct}%`, backgroundColor: cc.color }]} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + spacing[12] }]}
      >

        {/* ── ARTICLE HERO ──────────────────────────────── */}
        <View style={[s.hero, { backgroundColor: cc.bgColor }]}>
          <View style={s.heroTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtnHero} hitSlop={8}>
              <Text style={s.backArrow}>← Retour</Text>
            </TouchableOpacity>
            <FavoriteBadge isFavorite={article.isFavorite} onPress={() => toggleFavorite(article.id)} />
          </View>

          {/* Category badge */}
          <View style={[s.catBadge, { backgroundColor: cc.color + '22' }]}>
            <Text style={{ fontSize: 16 }}>{cc.emoji}</Text>
            <Text style={[s.catLabel, { color: cc.color }]}>{cc.label}</Text>
          </View>

          <Text style={s.heroTitle}>{article.title}</Text>
          <Text style={s.heroSummary}>{article.summary}</Text>

          {/* Meta row */}
          <View style={s.metaRow}>
            <ReadTimeBadge minutes={article.readTimeMinutes} />
            {article.author && (
              <Text style={s.author}>par {article.author}</Text>
            )}
            <Text style={s.date}>{fmt(article.publishedAt, 'd MMM yyyy')}</Text>
          </View>
        </View>

        {/* ── ARTICLE BODY ──────────────────────────────── */}
        <View style={s.body}>
          <ContentRenderer blocks={blocks} />
        </View>

        {/* ── TAGS ──────────────────────────────────────── */}
        {article.tags.length > 0 && (
          <View style={s.tagsSection}>
            <Text style={s.tagsLabel}>Thèmes abordés</Text>
            <View style={s.tagsRow}>
              {article.tags.map(tag => (
                <View key={tag} style={[s.tag, { backgroundColor: cc.bgColor, borderColor: cc.color + '44' }]}>
                  <Text style={[s.tagText, { color: cc.color }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── RELATED ARTICLES ──────────────────────────── */}
        {related.length > 0 && (
          <View style={s.relatedSection}>
            <SectionHeader title="Dans la même catégorie" style={{ marginBottom: spacing[4] }} />
            <View style={s.relatedList}>
              {related.map(rel => (
                <ArticleCardCompact
                  key={rel.id}
                  article={rel}
                  onPress={() => {
                    markRead(rel.id);
                    navigation.navigate('AdviceDetail', { articleId: rel.id });
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── BOTTOM CTA ────────────────────────────────── */}
        <View style={s.bottomCta}>
          <TouchableOpacity
            style={[s.favBtn, { backgroundColor: article.isFavorite ? colors.primaryLight : colors.surfaceAlt, borderColor: article.isFavorite ? colors.primary : colors.border }]}
            onPress={() => toggleFavorite(article.id)}
          >
            <Text style={{ fontSize: 18 }}>{article.isFavorite ? '❤️' : '🤍'}</Text>
            <Text style={[s.favBtnText, { color: article.isFavorite ? colors.primary : colors.textSecondary }]}>
              {article.isFavorite ? 'Sauvegardé' : 'Sauvegarder'}
            </Text>
          </TouchableOpacity>
          <Text style={s.readPct}>{readPct}% lu</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: colors.background },

  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    backgroundColor: colors.surface, paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
    borderBottomWidth: 1, borderBottomColor: colors.border,
    ...shadows.sm,
  },
  backBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  backArrow:    { fontSize: fontSize.base, color: colors.textSecondary, fontWeight: fontWeight.medium },
  stickyTitle:  { flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textPrimary },

  progressTrack: { height: 3, backgroundColor: colors.borderLight },
  progressFill:  { height: 3, borderRadius: 2 },

  scroll: { gap: 0 },

  hero: {
    paddingTop: spacing[6],
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  heroTop:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtnHero: {},
  catBadge:  { flexDirection: 'row', alignItems: 'center', gap: spacing[1.5], borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: spacing[1], alignSelf: 'flex-start' },
  catLabel:  { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  heroTitle: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extraBold, color: colors.textPrimary, lineHeight: fontSize['2xl'] * 1.25, letterSpacing: -0.5 },
  heroSummary: { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: fontSize.base * 1.65 },
  metaRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3], flexWrap: 'wrap' },
  author:    { fontSize: fontSize.xs, color: colors.textTertiary },
  date:      { fontSize: fontSize.xs, color: colors.textTertiary },

  body:      { paddingHorizontal: spacing[5], paddingTop: spacing[6], paddingBottom: spacing[2] },

  tagsSection:  { paddingHorizontal: spacing[5], paddingVertical: spacing[4], borderTopWidth: 1, borderTopColor: colors.borderLight },
  tagsLabel:    { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textTertiary, marginBottom: spacing[2] },
  tagsRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  tag:          { borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderWidth: 1 },
  tagText:      { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },

  relatedSection: { paddingHorizontal: spacing[5], paddingVertical: spacing[6], borderTopWidth: 1, borderTopColor: colors.borderLight },
  relatedList:    { gap: spacing[3] },

  bottomCta:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  favBtn:       { flexDirection: 'row', alignItems: 'center', gap: spacing[2], borderRadius: radius.full, paddingVertical: spacing[2.5], paddingHorizontal: spacing[5], borderWidth: 1.5 },
  favBtnText:   { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold },
  readPct:      { fontSize: fontSize.xs, color: colors.textTertiary },
});
