/**
 * features/advice/components/AdviceUI.tsx
 *
 * All reusable presentational components for the Conseils module.
 *
 * Exports:
 *   ArticleCard        — standard list item card
 *   ArticleCardHero    — large featured card with full-width tint
 *   ArticleCardCompact — small horizontal card (for related / suggestions)
 *   CategoryChip       — pill for filtering / category display
 *   CategoryCard       — large tappable category block
 *   ReadTimeBadge      — "N min" pill
 *   FavoriteBadge      — heart icon (filled / outlined)
 *   ContentRenderer    — renders parsed article blocks
 *   SectionHeader      — consistent section title + optional action
 *   ArticleListEmpty   — empty state for list / search
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ViewStyle, ScrollView,
} from 'react-native';

import { tokens } from '@theme/tokens';
import { fmt } from '@utils/date';
import { CATEGORY_CONFIGS, parseContent } from '../types';
import type { EnrichedArticle, CategoryConfig, ContentBlock } from '../types';

const { colors, spacing, radius, fontSize, fontWeight, shadows, palette } = tokens;

// ─────────────────────────────────────────────────────────────
//  READ TIME BADGE
// ─────────────────────────────────────────────────────────────

export function ReadTimeBadge({
  minutes, style,
}: { minutes: number; style?: ViewStyle }) {
  return (
    <View style={[rtS.badge, style]}>
      <Text style={rtS.text}>⏱ {minutes} min</Text>
    </View>
  );
}

const rtS = StyleSheet.create({
  badge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    fontWeight: fontWeight.medium,
  },
});

// ─────────────────────────────────────────────────────────────
//  FAVORITE BADGE  (heart icon)
// ─────────────────────────────────────────────────────────────

interface FavoriteBadgeProps {
  isFavorite: boolean;
  onPress:    () => void;
  size?:      number;
  style?:     ViewStyle;
}

export function FavoriteBadge({ isFavorite, onPress, size = 36, style }: FavoriteBadgeProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={8}
      activeOpacity={0.7}
      style={[
        {
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: isFavorite ? colors.primaryLight : colors.surfaceAlt,
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 1,
          borderColor: isFavorite ? colors.primary + '44' : colors.border,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.44 }}>{isFavorite ? '❤️' : '🤍'}</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
//  CATEGORY CHIP  (inline filter / label pill)
// ─────────────────────────────────────────────────────────────

interface CategoryChipProps {
  config:   CategoryConfig;
  active?:  boolean;
  onPress?: () => void;
  style?:   ViewStyle;
}

export function CategoryChip({ config, active, onPress, style }: CategoryChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.78}
      style={[
        ccS.chip,
        {
          backgroundColor: active ? config.color : colors.surfaceAlt,
          borderColor:     active ? config.color : colors.border,
        },
        style,
      ]}
    >
      <Text style={ccS.emoji}>{config.emoji}</Text>
      <Text style={[ccS.label, { color: active ? colors.textInverse : colors.textSecondary }]}>
        {config.label}
      </Text>
    </TouchableOpacity>
  );
}

const ccS = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1.5],
    paddingVertical: spacing[1.5], paddingHorizontal: spacing[3],
    borderRadius: radius.full, borderWidth: 1.5,
  },
  emoji: { fontSize: 14 },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});

// ─────────────────────────────────────────────────────────────
//  CATEGORY CARD  (large block for the category grid)
// ─────────────────────────────────────────────────────────────

interface CategoryCardProps {
  config:  CategoryConfig;
  count?:  number;
  onPress: () => void;
  style?:  ViewStyle;
}

export function CategoryCard({ config, count, onPress, style }: CategoryCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.86}
      style={[
        catS.card,
        { backgroundColor: config.bgColor, borderColor: config.color + '33' },
        style,
      ]}
    >
      <View style={[catS.iconWrap, { backgroundColor: config.color + '22' }]}>
        <Text style={catS.emoji}>{config.emoji}</Text>
      </View>
      <Text style={[catS.label, { color: config.color }]}>{config.label}</Text>
      {count !== undefined && (
        <Text style={catS.count}>{count} article{count !== 1 ? 's' : ''}</Text>
      )}
    </TouchableOpacity>
  );
}

const catS = StyleSheet.create({
  card: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing[5], paddingHorizontal: spacing[3],
    borderRadius: radius['2xl'], borderWidth: 1.5, gap: spacing[2],
    minHeight: 100,
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: radius.xl,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji:  { fontSize: 26 },
  label:  { fontSize: fontSize.sm, fontWeight: fontWeight.bold, textAlign: 'center' },
  count:  { fontSize: fontSize.xs, color: colors.textTertiary, textAlign: 'center' },
});

// ─────────────────────────────────────────────────────────────
//  ARTICLE CARD  (standard list item)
// ─────────────────────────────────────────────────────────────

interface ArticleCardProps {
  article:          EnrichedArticle;
  onPress:          () => void;
  onFavoriteToggle?: () => void;
  isRead?:          boolean;
  style?:           ViewStyle;
}

export function ArticleCard({ article, onPress, onFavoriteToggle, isRead, style }: ArticleCardProps) {
  const { categoryConfig: cc } = article;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.86}
      style={[acS.card, style]}
    >
      {/* Color stripe */}
      <View style={[acS.stripe, { backgroundColor: cc.color }]} />

      <View style={acS.body}>
        {/* Category + read time */}
        <View style={acS.meta}>
          <View style={[acS.catPill, { backgroundColor: cc.bgColor }]}>
            <Text style={{ fontSize: 11 }}>{cc.emoji}</Text>
            <Text style={[acS.catLabel, { color: cc.color }]}>{cc.label}</Text>
          </View>
          <ReadTimeBadge minutes={article.readTimeMinutes} />
          {isRead && (
            <View style={acS.readDot}>
              <Text style={acS.readText}>Lu</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={acS.title} numberOfLines={2}>{article.title}</Text>

        {/* Summary */}
        <Text style={acS.summary} numberOfLines={2}>{article.summary}</Text>

        {/* Tags + favorite */}
        <View style={acS.footer}>
          <View style={acS.tags}>
            {article.tags.slice(0, 2).map(tag => (
              <View key={tag} style={acS.tag}>
                <Text style={acS.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          {onFavoriteToggle && (
            <FavoriteBadge
              isFavorite={article.isFavorite}
              onPress={onFavoriteToggle}
              size={30}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const acS = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: radius.xl, overflow: 'hidden',
    ...shadows.sm, borderWidth: 1, borderColor: colors.borderLight,
  },
  stripe:   { width: 5 },
  body:     { flex: 1, padding: spacing[4], gap: spacing[2] },
  meta:     { flexDirection: 'row', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' },
  catPill:  { flexDirection: 'row', alignItems: 'center', gap: spacing[1], borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: spacing[0.5] },
  catLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },
  readDot:  { backgroundColor: colors.successLight, borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: spacing[0.5] },
  readText: { fontSize: fontSize.xs, color: colors.successText, fontWeight: fontWeight.semiBold },
  title:    { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary, lineHeight: fontSize.md * 1.3 },
  summary:  { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: fontSize.sm * 1.5 },
  footer:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing[1] },
  tags:     { flexDirection: 'row', gap: spacing[1.5], flex: 1 },
  tag:      { backgroundColor: colors.backgroundAlt, borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: 2 },
  tagText:  { fontSize: fontSize['2xs'], color: colors.textTertiary },
});

// ─────────────────────────────────────────────────────────────
//  ARTICLE CARD HERO  (featured — large)
// ─────────────────────────────────────────────────────────────

interface ArticleCardHeroProps {
  article:          EnrichedArticle;
  onPress:          () => void;
  onFavoriteToggle?: () => void;
}

export function ArticleCardHero({ article, onPress, onFavoriteToggle }: ArticleCardHeroProps) {
  const { categoryConfig: cc } = article;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.86}
      style={[
        heroS.card,
        { backgroundColor: cc.bgColor, borderColor: cc.color + '33' },
      ]}
    >
      {/* Header row */}
      <View style={heroS.header}>
        <View style={[heroS.catPill, { backgroundColor: cc.color + '22' }]}>
          <Text style={{ fontSize: 14 }}>{cc.emoji}</Text>
          <Text style={[heroS.catLabel, { color: cc.color }]}>{cc.label}</Text>
        </View>
        {onFavoriteToggle && (
          <FavoriteBadge isFavorite={article.isFavorite} onPress={onFavoriteToggle} />
        )}
      </View>

      {/* Title */}
      <Text style={heroS.title} numberOfLines={3}>{article.title}</Text>

      {/* Summary */}
      <Text style={heroS.summary} numberOfLines={3}>{article.summary}</Text>

      {/* Footer */}
      <View style={heroS.footer}>
        <ReadTimeBadge minutes={article.readTimeMinutes} />
        <Text style={[heroS.cta, { color: cc.color }]}>Lire l'article →</Text>
      </View>
    </TouchableOpacity>
  );
}

const heroS = StyleSheet.create({
  card: {
    borderRadius: radius['2xl'], padding: spacing[6],
    borderWidth: 1.5, gap: spacing[4],
    ...shadows.md,
  },
  header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catPill:  { flexDirection: 'row', alignItems: 'center', gap: spacing[1.5], borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: spacing[1] },
  catLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  title:    { fontSize: fontSize.xl, fontWeight: fontWeight.extraBold, color: colors.textPrimary, lineHeight: fontSize.xl * 1.25, letterSpacing: -0.3 },
  summary:  { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: fontSize.base * 1.6 },
  footer:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing[1] },
  cta:      { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
});

// ─────────────────────────────────────────────────────────────
//  ARTICLE CARD COMPACT  (related articles, suggestions)
// ─────────────────────────────────────────────────────────────

export function ArticleCardCompact({ article, onPress }: { article: EnrichedArticle; onPress: () => void }) {
  const { categoryConfig: cc } = article;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.86} style={compS.card}>
      <View style={[compS.iconWrap, { backgroundColor: cc.bgColor }]}>
        <Text style={{ fontSize: 22 }}>{cc.emoji}</Text>
      </View>
      <View style={compS.text}>
        <Text style={compS.title} numberOfLines={2}>{article.title}</Text>
        <Text style={compS.meta}>{cc.label} · {article.readTimeMinutes} min</Text>
      </View>
    </TouchableOpacity>
  );
}

const compS = StyleSheet.create({
  card:    { flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[4], ...shadows.xs, borderWidth: 1, borderColor: colors.borderLight },
  iconWrap: { width: 44, height: 44, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  text:    { flex: 1, gap: spacing[0.5] },
  title:   { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textPrimary, lineHeight: fontSize.sm * 1.3 },
  meta:    { fontSize: fontSize.xs, color: colors.textTertiary },
});

// ─────────────────────────────────────────────────────────────
//  CONTENT RENDERER  (structured article body)
// ─────────────────────────────────────────────────────────────

export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <View style={crS.root}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <View key={i} style={crS.headingWrap}>
                <Text style={crS.heading}>{block.text}</Text>
                <View style={crS.headingLine} />
              </View>
            );
          case 'subheading':
            return <Text key={i} style={crS.subheading}>{block.text}</Text>;
          case 'bold_paragraph':
            return (
              <View key={i} style={crS.boldWrap}>
                <Text style={crS.boldParagraph}>{block.text}</Text>
              </View>
            );
          case 'paragraph':
            return <Text key={i} style={crS.paragraph}>{block.text}</Text>;
          case 'bullet_list':
            return (
              <View key={i} style={crS.list}>
                {(block.items ?? []).map((item, j) => (
                  <View key={j} style={crS.listItem}>
                    <View style={crS.bullet} />
                    <Text style={crS.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            );
          default:
            return null;
        }
      })}
    </View>
  );
}

const crS = StyleSheet.create({
  root:        { gap: spacing[1] },
  headingWrap: { paddingTop: spacing[4], paddingBottom: spacing[1], gap: spacing[2] },
  heading:     { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, letterSpacing: -0.3 },
  headingLine: { height: 2.5, width: 32, backgroundColor: colors.primary, borderRadius: 2 },
  subheading:  { fontSize: fontSize.lg, fontWeight: fontWeight.semiBold, color: colors.textPrimary, paddingTop: spacing[3] },
  boldWrap: {
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.lg,
    padding: spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginVertical: spacing[1],
  },
  boldParagraph: { fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.textPrimary, lineHeight: fontSize.base * 1.55 },
  paragraph:     { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: fontSize.base * 1.75 },
  list:          { gap: spacing[2], paddingVertical: spacing[1] },
  listItem:      { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  bullet: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: fontSize.base * 1.75 / 2 - 3,
    flexShrink: 0,
  },
  listText:  { flex: 1, fontSize: fontSize.base, color: colors.textSecondary, lineHeight: fontSize.base * 1.7 },
});

// ─────────────────────────────────────────────────────────────
//  SECTION HEADER
// ─────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title:       string;
  actionLabel?: string;
  onAction?:   () => void;
  style?:      ViewStyle;
}

export function SectionHeader({ title, actionLabel, onAction, style }: SectionHeaderProps) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, style]}>
      <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary }}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.primary }}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  EMPTY STATE
// ─────────────────────────────────────────────────────────────

export function ArticleListEmpty({ emoji, title, subtitle }: {
  emoji: string; title: string; subtitle?: string;
}) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing[12], gap: spacing[3] }}>
      <Text style={{ fontSize: 48 }}>{emoji}</Text>
      <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, textAlign: 'center' }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', maxWidth: 280 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
