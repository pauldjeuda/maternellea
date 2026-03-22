/**
 * features/home/components/DashboardCards.tsx
 *
 * Design-system card primitives used by all three dashboard variants.
 * Zero business logic — pure presentation.
 *
 * Exports:
 *   SurfaceCard    – base card with optional press, gradient tint
 *   HeaderCard     – top hero card with large number + label
 *   StatRow        – two stat pills side by side
 *   StatPill       – single stat (label + value)
 *   QuickAction    – icon + label tappable shortcut
 *   QuickActionsRow – row of 3-4 quick actions
 *   TipCard        – "conseil du jour / de la semaine" card
 *   SectionTitle   – h5 + optional "Voir tout" link
 *   InfoRow        – icon + title + subtitle row inside a card
 *   ProgressRing   – SVG circular progress (pure RN, no deps)
 *   VaccineBadge   – colored status badge for vaccines
 *   MoodDot        – colored emoji dot for mood level
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle,
} from 'react-native';
import { tokens } from '@theme/tokens';

const { colors, spacing, radius, fontSize, fontWeight, shadows, palette } = tokens;

// ─────────────────────────────────────────────────────────────
//  SURFACE CARD
// ─────────────────────────────────────────────────────────────

interface SurfaceCardProps {
  children:    React.ReactNode;
  onPress?:    () => void;
  style?:      ViewStyle;
  tint?:       string;   // e.g. colors.primarySubtle
  padded?:     boolean;
  outlined?:   boolean;
}

export function SurfaceCard({
  children, onPress, style, tint, padded = true, outlined = false,
}: SurfaceCardProps) {
  const inner: ViewStyle = {
    backgroundColor: tint ?? colors.surface,
    borderRadius:    radius['2xl'],
    ...(padded && { padding: spacing[5] }),
    ...(outlined && { borderWidth: 1.5, borderColor: colors.border }),
    ...(!outlined && shadows.sm),
  };

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.86} onPress={onPress} style={[inner, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[inner, style]}>{children}</View>;
}

// ─────────────────────────────────────────────────────────────
//  HERO HEADER CARD  (large metric + subtitle + emoji)
// ─────────────────────────────────────────────────────────────

interface HeroCardProps {
  label:       string;
  metric:      string;
  metricSub?:  string;
  emoji:       string;
  accent:      string;   // brand color for metric text
  bg:          string;   // card background
  children?:   React.ReactNode;
  onPress?:    () => void;
  style?:      ViewStyle;
}

export function HeroCard({
  label, metric, metricSub, emoji, accent, bg, children, onPress, style,
}: HeroCardProps) {
  return (
    <SurfaceCard tint={bg} onPress={onPress} style={style}>
      <View style={heroS.row}>
        <View style={heroS.left}>
          <Text style={[heroS.label, { color: accent }]}>{label}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing[1] }}>
            <Text style={[heroS.metric, { color: accent }]}>{metric}</Text>
            {metricSub && (
              <Text style={[heroS.metricSub, { color: accent + 'CC' }]}>{metricSub}</Text>
            )}
          </View>
        </View>
        <View style={[heroS.emojiWrap, { backgroundColor: accent + '22' }]}>
          <Text style={heroS.emoji}>{emoji}</Text>
        </View>
      </View>
      {children}
    </SurfaceCard>
  );
}

const heroS = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  left:      { flex: 1, gap: spacing[1] },
  label:     { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, letterSpacing: 0.3, textTransform: 'uppercase', opacity: 0.7 },
  metric:    { fontSize: fontSize['4xl'], fontWeight: fontWeight.extraBold, letterSpacing: -1.5 },
  metricSub: { fontSize: fontSize.lg, fontWeight: fontWeight.semiBold },
  emojiWrap: { width: 52, height: 52, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  emoji:     { fontSize: 28 },
});

// ─────────────────────────────────────────────────────────────
//  STAT PILL
// ─────────────────────────────────────────────────────────────

interface StatPillProps {
  label:   string;
  value:   string;
  accent?: string;
  icon?:   string;
  style?:  ViewStyle;
}

export function StatPill({ label, value, accent = colors.primary, icon, style }: StatPillProps) {
  return (
    <View style={[statS.pill, style]}>
      {icon && <Text style={statS.icon}>{icon}</Text>}
      <Text style={statS.label}>{label}</Text>
      <Text style={[statS.value, { color: accent }]}>{value}</Text>
    </View>
  );
}

export function StatRow({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[statS.row, style]}>{children}</View>;
}

const statS = StyleSheet.create({
  row:   { flexDirection: 'row', gap: spacing[3] },
  pill: {
    flex:            1,
    backgroundColor: colors.surfaceAlt,
    borderRadius:    radius.xl,
    padding:         spacing[4],
    alignItems:      'center',
    gap:             spacing[1],
    borderWidth:     1,
    borderColor:     colors.borderLight,
  },
  icon:  { fontSize: 22 },
  label: { fontSize: fontSize.xs, color: colors.textTertiary, fontWeight: fontWeight.medium, textAlign: 'center' },
  value: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, textAlign: 'center' },
});

// ─────────────────────────────────────────────────────────────
//  QUICK ACTIONS
// ─────────────────────────────────────────────────────────────

interface QuickActionProps {
  emoji:    string;
  label:    string;
  onPress:  () => void;
  accent?:  string;
}

export function QuickAction({ emoji, label, onPress, accent = colors.primary }: QuickActionProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.78} style={qaS.wrap}>
      <View style={[qaS.icon, { backgroundColor: accent + '1A' }]}>
        <Text style={qaS.emoji}>{emoji}</Text>
      </View>
      <Text style={qaS.label} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

export function QuickActionsRow({ children }: { children: React.ReactNode }) {
  return <View style={qaS.row}>{children}</View>;
}

const qaS = StyleSheet.create({
  row:   { flexDirection: 'row', gap: spacing[3] },
  wrap:  { flex: 1, alignItems: 'center', gap: spacing[2] },
  icon: {
    width: 52, height: 52, borderRadius: radius.xl,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 24 },
  label: {
    fontSize:  fontSize.xs,
    fontWeight: fontWeight.medium,
    color:     colors.textSecondary,
    textAlign: 'center',
  },
});

// ─────────────────────────────────────────────────────────────
//  TIP CARD
// ─────────────────────────────────────────────────────────────

interface TipCardProps {
  label:     string;
  title:     string;
  summary:   string;
  readMin:   number;
  onPress?:  () => void;
  accent?:   string;
}

export function TipCard({ label, title, summary, readMin, onPress, accent = colors.primary }: TipCardProps) {
  return (
    <SurfaceCard tint={accent + '0F'} onPress={onPress} outlined style={{ borderColor: accent + '33' }}>
      <View style={tipS.header}>
        <View style={[tipS.badge, { backgroundColor: accent + '22' }]}>
          <Text style={[tipS.badgeText, { color: accent }]}>{label}</Text>
        </View>
        <Text style={tipS.readMin}>{readMin} min</Text>
      </View>
      <Text style={tipS.title} numberOfLines={2}>{title}</Text>
      <Text style={tipS.summary} numberOfLines={3}>{summary}</Text>
    </SurfaceCard>
  );
}

const tipS = StyleSheet.create({
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] },
  badge:     { borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: spacing[1] },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },
  readMin:   { fontSize: fontSize.xs, color: colors.textTertiary },
  title:     { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[2], lineHeight: fontSize.md * 1.3 },
  summary:   { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: fontSize.sm * 1.6 },
});

// ─────────────────────────────────────────────────────────────
//  SECTION TITLE
// ─────────────────────────────────────────────────────────────

interface SectionTitleProps {
  title:       string;
  actionLabel?: string;
  onAction?:   () => void;
  style?:      ViewStyle;
}

export function SectionTitle({ title, actionLabel, onAction, style }: SectionTitleProps) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, style]}>
      <Text style={stS.title}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={stS.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const stS = StyleSheet.create({
  title:  { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
  action: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.primary },
});

// ─────────────────────────────────────────────────────────────
//  INFO ROW  (icon + title + sub inside a card)
// ─────────────────────────────────────────────────────────────

interface InfoRowProps {
  icon:      string;
  title:     string;
  subtitle?: string;
  accent?:   string;
  right?:    React.ReactNode;
  onPress?:  () => void;
}

export function InfoRow({ icon, title, subtitle, accent = colors.primary, right, onPress }: InfoRowProps) {
  const inner = (
    <View style={irS.row}>
      <View style={[irS.iconWrap, { backgroundColor: accent + '1A' }]}>
        <Text style={irS.icon}>{icon}</Text>
      </View>
      <View style={irS.text}>
        <Text style={irS.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={irS.sub} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {right && <View>{right}</View>}
    </View>
  );
  if (onPress) return <TouchableOpacity activeOpacity={0.78} onPress={onPress}>{inner}</TouchableOpacity>;
  return inner;
}

const irS = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  iconWrap: { width: 42, height: 42, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  icon:     { fontSize: 20 },
  text:     { flex: 1, gap: spacing[0.5] },
  title:    { fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.textPrimary },
  sub:      { fontSize: fontSize.sm, color: colors.textSecondary },
});

// ─────────────────────────────────────────────────────────────
//  INLINE PROGRESS BAR  (compact, used inside HeroCard)
// ─────────────────────────────────────────────────────────────

interface InlineProgressProps {
  value:      number;   // 0–100
  color:      string;
  trackColor: string;
  height?:    number;
  label?:     string;
  style?:     ViewStyle;
}

export function InlineProgress({ value, color, trackColor, height = 6, label, style }: InlineProgressProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <View style={style}>
      {label && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[1] }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.textTertiary }}>{label}</Text>
          <Text style={{ fontSize: fontSize.xs, color, fontWeight: fontWeight.semiBold }}>{Math.round(pct)}%</Text>
        </View>
      )}
      <View style={{ height, backgroundColor: trackColor, borderRadius: radius.full, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: radius.full }} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  VACCINE STATUS BADGE
// ─────────────────────────────────────────────────────────────

const VACCINE_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  upcoming:  { bg: colors.surfaceAlt,    text: colors.textTertiary   },
  due_soon:  { bg: colors.warningLight,  text: colors.warningText    },
  done:      { bg: colors.successLight,  text: colors.successText    },
  overdue:   { bg: colors.errorLight,    text: colors.errorText      },
  skipped:   { bg: colors.surfaceAlt,    text: colors.textDisabled   },
};

const VACCINE_STATUS_FR: Record<string, string> = {
  upcoming: 'À venir', due_soon: 'Bientôt', done: 'Effectué', overdue: 'En retard', skipped: 'Ignoré',
};

export function VaccineBadge({ status }: { status: string }) {
  const c = VACCINE_STATUS_COLORS[status] ?? VACCINE_STATUS_COLORS['upcoming']!;
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: spacing[0.5] }}>
      <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semiBold, color: c.text }}>
        {VACCINE_STATUS_FR[status] ?? status}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  MOOD DOT
// ─────────────────────────────────────────────────────────────

const MOOD_COLORS = [
  '',
  palette.red400,
  palette.peach400,
  palette.amber400,
  palette.sage400,
  palette.green500,
];
const MOOD_EMOJIS_LOCAL = ['', '😔', '😕', '😐', '🙂', '😊'];

export function MoodDot({ level, size = 28 }: { level: number; size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: (MOOD_COLORS[level] ?? colors.surfaceAlt) + '22',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontSize: size * 0.58 }}>{MOOD_EMOJIS_LOCAL[level] ?? '•'}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  GREETING HEADER
// ─────────────────────────────────────────────────────────────

export function GreetingHeader({ name }: { name: string }) {
  const hour     = new Date().getHours();
  const greeting = hour < 6 ? 'Bonne nuit' : hour < 12 ? 'Bonjour' : hour < 18 ? 'Bonjour' : 'Bonsoir';

  return (
    <View style={ghS.wrap}>
      <View>
        <Text style={ghS.greeting}>{greeting},</Text>
        <Text style={ghS.name}>{name} 👋</Text>
      </View>
      <View style={ghS.avatar}>
        <Text style={{ fontSize: 22, color: colors.primary, fontWeight: fontWeight.bold }}>
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const ghS = StyleSheet.create({
  wrap:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  name:     { fontSize: fontSize['2xl'], fontWeight: fontWeight.extraBold, color: colors.textPrimary, letterSpacing: -0.5 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.coloredSm,
  },
});
