/**
 * features/vaccines/components/VaccineUI.tsx
 *
 * Shared presentational components for the vaccine module.
 *
 * Exports:
 *   StatusBadge        – colored pill for overdue/due_soon/done/upcoming
 *   VaccineCard        – full list item with disease tags + status
 *   VaccineGroupHeader – series header with progress indicator
 *   StatsBar           – horizontal progress bar with counts
 *   TimelineRow        – compact history row
 *   DiseaseTag         – small pill for a disease name
 *   SectionHeader      – consistent title + optional action
 *   EmptyCard          – centered empty state
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ViewStyle,
} from 'react-native';

import { tokens } from '@theme/tokens';
import { fmtShort } from '@utils/date';
import { VACCINE_STATUS_CONFIG } from '../types';
import { daysLabel } from '../utils/vaccineCalc';
import type { VaccineStatusResult, VaccineGroup, VaccineStats } from '../types';

const { colors, spacing, radius, fontSize, fontWeight, shadows, palette } = tokens;

// ─────────────────────────────────────────────────────────────
//  STATUS BADGE
// ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string;
  size?:  'sm' | 'md';
  style?: ViewStyle;
}

export function StatusBadge({ status, size = 'md', style }: StatusBadgeProps) {
  const cfg = VACCINE_STATUS_CONFIG[status as keyof typeof VACCINE_STATUS_CONFIG]
    ?? VACCINE_STATUS_CONFIG.upcoming;

  return (
    <View style={[
      sbS.badge,
      { backgroundColor: cfg.bgColor },
      size === 'sm' && sbS.sm,
      style,
    ]}>
      <Text style={sbS.emoji}>{cfg.emoji}</Text>
      <Text style={[sbS.label, { color: cfg.color }, size === 'sm' && sbS.labelSm]}>
        {cfg.label}
      </Text>
    </View>
  );
}

const sbS = StyleSheet.create({
  badge:   { flexDirection: 'row', alignItems: 'center', gap: spacing[1], borderRadius: radius.full, paddingVertical: spacing[1], paddingHorizontal: spacing[3], alignSelf: 'flex-start' },
  sm:      { paddingVertical: spacing[0.5], paddingHorizontal: spacing[2] },
  emoji:   { fontSize: 13 },
  label:   { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold },
  labelSm: { fontSize: fontSize.xs },
});

// ─────────────────────────────────────────────────────────────
//  DISEASE TAG
// ─────────────────────────────────────────────────────────────

export function DiseaseTag({ name }: { name: string }) {
  return (
    <View style={dtS.tag}>
      <Text style={dtS.text}>{name}</Text>
    </View>
  );
}

const dtS = StyleSheet.create({
  tag:  { backgroundColor: colors.infoLight, borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: spacing[0.5] },
  text: { fontSize: fontSize['2xs'], color: colors.info, fontWeight: fontWeight.semiBold },
});

// ─────────────────────────────────────────────────────────────
//  VACCINE CARD  (list item)
// ─────────────────────────────────────────────────────────────

interface VaccineCardProps {
  result:   VaccineStatusResult;
  onPress?: () => void;
  compact?: boolean;
}

export function VaccineCard({ result, onPress, compact }: VaccineCardProps) {
  const { definition, status, scheduledDate, daysFromNow, isDone, record } = result;
  const cfg = VACCINE_STATUS_CONFIG[status];

  const stripeColor =
    status === 'overdue'  ? colors.error  :
    status === 'due_soon' ? colors.warning :
    status === 'done'     ? colors.success : colors.border;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.86}
      style={[vcS.card, isDone && vcS.cardDone]}
    >
      <View style={[vcS.stripe, { backgroundColor: stripeColor }]} />

      <View style={vcS.body}>
        {/* Top row: name + badge */}
        <View style={vcS.topRow}>
          <View style={{ flex: 1, gap: spacing[0.5] }}>
            <Text style={[vcS.name, isDone && vcS.nameDone]} numberOfLines={2}>
              {definition.name}
            </Text>
            <Text style={vcS.series}>
              {definition.seriesName}
              {definition.numberOfDoses > 1 ? ` — dose ${definition.doseNumber}/${definition.numberOfDoses}` : ''}
            </Text>
          </View>
          <StatusBadge status={status} size="sm" />
        </View>

        {/* Date info */}
        <View style={vcS.dateRow}>
          {isDone && record?.administeredDate ? (
            <>
              <Text style={vcS.dateIcon}>✓</Text>
              <Text style={[vcS.dateText, { color: colors.successText }]}>
                Fait le {fmtShort(record.administeredDate)}
                {record.administeredBy ? ` · ${record.administeredBy}` : ''}
              </Text>
            </>
          ) : (
            <>
              <Text style={vcS.dateIcon}>📅</Text>
              <Text style={[
                vcS.dateText,
                status === 'overdue'  && { color: colors.errorText },
                status === 'due_soon' && { color: colors.warningText },
              ]}>
                {daysLabel(daysFromNow)} · {fmtShort(scheduledDate)}
              </Text>
            </>
          )}
        </View>

        {/* Diseases (non-compact) */}
        {!compact && (
          <View style={vcS.diseases}>
            {definition.diseases.slice(0, 4).map(d => (
              <DiseaseTag key={d} name={d} />
            ))}
            {definition.diseases.length > 4 && (
              <Text style={vcS.moreTag}>+{definition.diseases.length - 4}</Text>
            )}
          </View>
        )}

        {/* Notes */}
        {!compact && record?.notes && (
          <Text style={vcS.notes} numberOfLines={2}>📝 {record.notes}</Text>
        )}

        {/* Mandatory badge */}
        {definition.isMandatory && (
          <View style={vcS.mandatory}>
            <Text style={vcS.mandatoryText}>Obligatoire</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const vcS = StyleSheet.create({
  card:     { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...shadows.xs, borderWidth: 1, borderColor: colors.borderLight },
  cardDone: { opacity: 0.8 },
  stripe:   { width: 5 },
  body:     { flex: 1, padding: spacing[4], gap: spacing[2] },
  topRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  name:     { fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.textPrimary, lineHeight: fontSize.base * 1.3 },
  nameDone: { color: colors.textSecondary },
  series:   { fontSize: fontSize.xs, color: colors.textTertiary },
  dateRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  dateIcon: { fontSize: 13 },
  dateText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  diseases: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1.5] },
  moreTag:  { fontSize: fontSize.xs, color: colors.textTertiary, alignSelf: 'center' },
  notes:    { fontSize: fontSize.sm, color: colors.textTertiary, fontStyle: 'italic' },
  mandatory: { alignSelf: 'flex-start', backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: 2 },
  mandatoryText: { fontSize: fontSize['2xs'], color: colors.primary, fontWeight: fontWeight.bold },
});

// ─────────────────────────────────────────────────────────────
//  VACCINE GROUP HEADER  (series fold)
// ─────────────────────────────────────────────────────────────

interface VaccineGroupHeaderProps {
  group:    VaccineGroup;
  expanded: boolean;
  onToggle: () => void;
}

export function VaccineGroupHeader({ group, expanded, onToggle }: VaccineGroupHeaderProps) {
  const done  = group.definitions.filter(d => d.isDone).length;
  const total = group.definitions.length;
  const pct   = Math.round((done / total) * 100);

  const accent =
    group.hasOverdue  ? colors.error   :
    group.hasDueSoon  ? colors.warning  :
    group.allDone     ? colors.success : colors.secondary;

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.86} style={ghS.wrap}>
      <View style={[ghS.iconWrap, { backgroundColor: accent + '1A' }]}>
        <Text style={{ fontSize: 22 }}>{group.seriesEmoji}</Text>
      </View>

      <View style={{ flex: 1, gap: spacing[1] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={ghS.name}>{group.seriesName}</Text>
          <Text style={[ghS.count, { color: accent }]}>{done}/{total}</Text>
        </View>

        {/* Progress bar */}
        <View style={ghS.track}>
          <View style={[ghS.fill, { width: `${pct}%`, backgroundColor: accent }]} />
        </View>

        {/* Status hint */}
        {(group.hasOverdue || group.hasDueSoon) && (
          <Text style={[ghS.hint, { color: accent }]}>
            {group.hasOverdue ? '⚠️ En retard' : '🔔 Bientôt dû'}
          </Text>
        )}
      </View>

      <Text style={[ghS.chevron, expanded && ghS.chevronUp]}>›</Text>
    </TouchableOpacity>
  );
}

const ghS = StyleSheet.create({
  wrap:       { flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[4], ...shadows.xs, borderWidth: 1, borderColor: colors.borderLight },
  iconWrap:   { width: 44, height: 44, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  name:       { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary },
  count:      { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  track:      { height: 5, backgroundColor: colors.borderLight, borderRadius: radius.full, overflow: 'hidden' },
  fill:       { height: '100%', borderRadius: radius.full },
  hint:       { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },
  chevron:    { fontSize: 22, color: colors.textTertiary, fontWeight: fontWeight.bold, transform: [{ rotate: '0deg' }] },
  chevronUp:  { transform: [{ rotate: '90deg' }] },
});

// ─────────────────────────────────────────────────────────────
//  STATS BAR
// ─────────────────────────────────────────────────────────────

interface StatsBarProps {
  stats: VaccineStats;
  style?: ViewStyle;
}

export function StatsBar({ stats, style }: StatsBarProps) {
  return (
    <View style={[stS.wrap, style]}>
      {/* Progress ring / bar */}
      <View style={stS.barWrap}>
        <View style={stS.track}>
          <View style={[stS.fill, { width: `${stats.pctDone}%` }]} />
        </View>
        <Text style={stS.pct}>{stats.pctDone}% complétés</Text>
      </View>

      {/* Counts */}
      <View style={stS.counts}>
        <StatCount value={stats.done}     label="Faits"     color={colors.success} />
        <StatCount value={stats.overdue}  label="En retard" color={colors.error} />
        <StatCount value={stats.dueSoon}  label="Bientôt"   color={colors.warning} />
        <StatCount value={stats.upcoming} label="À venir"   color={colors.textTertiary} />
      </View>
    </View>
  );
}

function StatCount({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', gap: spacing[0.5] }}>
      <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.extraBold, color }}>{value}</Text>
      <Text style={{ fontSize: fontSize.xs, color: colors.textTertiary }}>{label}</Text>
    </View>
  );
}

const stS = StyleSheet.create({
  wrap:    { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[5], gap: spacing[4], ...shadows.xs, borderWidth: 1, borderColor: colors.borderLight },
  barWrap: { gap: spacing[1] },
  track:   { height: 10, backgroundColor: colors.borderLight, borderRadius: radius.full, overflow: 'hidden' },
  fill:    { height: '100%', backgroundColor: colors.success, borderRadius: radius.full },
  pct:     { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  counts:  { flexDirection: 'row', justifyContent: 'space-around' },
});

// ─────────────────────────────────────────────────────────────
//  TIMELINE ROW  (history screen)
// ─────────────────────────────────────────────────────────────

interface TimelineRowProps {
  result:  VaccineStatusResult;
  onPress?: () => void;
  isLast?: boolean;
}

export function TimelineRow({ result, onPress, isLast }: TimelineRowProps) {
  const { definition, record, isDone } = result;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.86}
      style={tlS.wrap}
    >
      {/* Timeline line */}
      <View style={tlS.lineWrap}>
        <View style={[tlS.dot, isDone && tlS.dotDone]} />
        {!isLast && <View style={tlS.line} />}
      </View>

      <View style={tlS.content}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, gap: spacing[0.5] }}>
            <Text style={tlS.name} numberOfLines={2}>{definition.name}</Text>
            {isDone && record?.administeredBy && (
              <Text style={tlS.by}>{record.administeredBy}</Text>
            )}
            {isDone && record?.location && (
              <Text style={tlS.location}>📍 {record.location}</Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end', gap: spacing[0.5] }}>
            <Text style={[tlS.date, isDone && { color: colors.successText }]}>
              {isDone && record?.administeredDate ? fmtShort(record.administeredDate) : fmtShort(result.scheduledDate)}
            </Text>
            <StatusBadge status={result.status} size="sm" />
          </View>
        </View>
        {record?.sideEffects && (
          <Text style={tlS.sideEffect}>🌡️ {record.sideEffects}</Text>
        )}
        {record?.notes && (
          <Text style={tlS.notes} numberOfLines={2}>📝 {record.notes}</Text>
        )}
        <View style={tlS.diseases}>
          {definition.diseases.slice(0, 3).map(d => <DiseaseTag key={d} name={d} />)}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const tlS = StyleSheet.create({
  wrap:      { flexDirection: 'row', gap: spacing[3], paddingBottom: spacing[4] },
  lineWrap:  { alignItems: 'center', width: 20 },
  dot:       { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border, borderWidth: 2, borderColor: colors.border, marginTop: 4 },
  dotDone:   { backgroundColor: colors.success, borderColor: colors.success },
  line:      { flex: 1, width: 2, backgroundColor: colors.borderLight, marginTop: spacing[1] },
  content:   { flex: 1, gap: spacing[2], paddingBottom: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  name:      { fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.textPrimary },
  by:        { fontSize: fontSize.xs, color: colors.textSecondary },
  location:  { fontSize: fontSize.xs, color: colors.textTertiary },
  date:      { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textSecondary },
  sideEffect:{ fontSize: fontSize.sm, color: colors.warningText, backgroundColor: colors.warningLight, borderRadius: radius.sm, paddingHorizontal: spacing[2], paddingVertical: 2 },
  notes:     { fontSize: fontSize.sm, color: colors.textTertiary, fontStyle: 'italic' },
  diseases:  { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1.5] },
});

// ─────────────────────────────────────────────────────────────
//  SECTION HEADER
// ─────────────────────────────────────────────────────────────

export function SectionHeader({
  title, actionLabel, onAction, style,
}: { title: string; actionLabel?: string; onAction?: () => void; style?: ViewStyle }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, style]}>
      <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary }}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.fertile }}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  EMPTY CARD
// ─────────────────────────────────────────────────────────────

export function EmptyCard({ emoji, title, subtitle, onAction, actionLabel }: {
  emoji: string; title: string; subtitle?: string; onAction?: () => void; actionLabel?: string;
}) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing[10], gap: spacing[3] }}>
      <Text style={{ fontSize: 48 }}>{emoji}</Text>
      <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, textAlign: 'center' }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', maxWidth: 260 }}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} style={{ backgroundColor: colors.fertile, borderRadius: radius.full, paddingVertical: spacing[3], paddingHorizontal: spacing[7], marginTop: spacing[2], ...shadows.sm }}>
          <Text style={{ color: colors.textInverse, fontWeight: fontWeight.semiBold, fontSize: fontSize.base }}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
