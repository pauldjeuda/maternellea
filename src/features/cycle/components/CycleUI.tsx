/**
 * features/cycle/components/CycleUI.tsx
 *
 * Reusable UI primitives for the cycle module.
 *
 * Exports:
 *   FlowPicker        – 4-level flow intensity selector
 *   ScaleSelector     – 1–5 scale (mood, fatigue) or 0–5 (pain)
 *   SymptomGrid       – multi-select symptom chips
 *   CalendarCell      – single calendar day cell
 *   CalendarLegend    – colour key for the calendar
 *   CycleEntryCard    – list item for a past period entry
 *   SymptomEntryCard  – list item for a symptom/note entry
 *   SectionHeader     – consistent section header with optional CTA
 *   EmptyState        – empty list placeholder
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ViewStyle,
} from 'react-native';

import { tokens } from '@theme/tokens';
import {
  SYMPTOM_LABELS, FLOW_LABELS, MOOD_EMOJIS, MOOD_LABELS,
  FATIGUE_LABELS, PAIN_LABELS,
} from '@constants';
import { fmt, fmtShort, dayLabel } from '@utils/date';
import type { CalendarDay } from '../types';
import type { CycleEntry, SymptomEntry } from '@types/models';

const { colors, spacing, radius, fontSize, fontWeight, shadows, palette } = tokens;

// ─────────────────────────────────────────────────────────────
//  FLOW PICKER
// ─────────────────────────────────────────────────────────────

const FLOW_CONFIG = [
  { value: 'spotting', emoji: '·',   label: 'Spotting',   color: palette.rose200 },
  { value: 'light',    emoji: '◔',   label: 'Légères',    color: palette.rose300 },
  { value: 'medium',   emoji: '◑',   label: 'Moyennes',   color: palette.rose400 },
  { value: 'heavy',    emoji: '●',   label: 'Abondantes', color: palette.rose600 },
] as const;

interface FlowPickerProps {
  value?:    string;
  onChange:  (v: 'spotting' | 'light' | 'medium' | 'heavy') => void;
  style?:    ViewStyle;
}

export function FlowPicker({ value, onChange, style }: FlowPickerProps) {
  return (
    <View style={[{ flexDirection: 'row', gap: spacing[2] }, style]}>
      {FLOW_CONFIG.map(f => {
        const selected = value === f.value;
        return (
          <TouchableOpacity
            key={f.value}
            onPress={() => onChange(f.value)}
            activeOpacity={0.78}
            style={[
              flowS.chip,
              selected && { backgroundColor: f.color, borderColor: f.color },
            ]}
          >
            <Text style={[flowS.emoji, { color: selected ? colors.textInverse : f.color }]}>
              {f.emoji}
            </Text>
            <Text style={[flowS.label, { color: selected ? colors.textInverse : colors.textSecondary }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const flowS = StyleSheet.create({
  chip: {
    flex:            1,
    alignItems:      'center',
    paddingVertical: spacing[2.5],
    borderRadius:    radius.lg,
    borderWidth:     1.5,
    borderColor:     colors.border,
    backgroundColor: colors.surfaceAlt,
    gap:             spacing[1],
  },
  emoji: { fontSize: 16, fontWeight: fontWeight.bold },
  label: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, textAlign: 'center' },
});

// ─────────────────────────────────────────────────────────────
//  SCALE SELECTOR  (mood 1–5, fatigue 1–5, pain 0–5)
// ─────────────────────────────────────────────────────────────

interface ScaleSelectorProps {
  type:      'mood' | 'fatigue' | 'pain';
  value:     number;
  onChange:  (v: number) => void;
  style?:    ViewStyle;
}

const SCALE_CONFIG = {
  mood: {
    min: 1, max: 5,
    labels: MOOD_LABELS,
    emoji:  MOOD_EMOJIS,
    colors: [palette.red400, palette.peach400, palette.amber400, palette.sage400, palette.green500],
  },
  fatigue: {
    min: 1, max: 5,
    labels: FATIGUE_LABELS,
    emoji:  { 1: '⚡', 2: '🔋', 3: '😶', 4: '😩', 5: '💀' } as Record<number, string>,
    colors: [palette.green500, palette.sage400, palette.amber400, palette.peach400, palette.red400],
  },
  pain: {
    min: 0, max: 5,
    labels: PAIN_LABELS,
    emoji:  { 0: '✨', 1: '🤏', 2: '😐', 3: '😣', 4: '😖', 5: '🆘' } as Record<number, string>,
    colors: [palette.green500, palette.sage300, palette.amber400, palette.peach400, palette.red400, palette.red500],
  },
} as const;

export function ScaleSelector({ type, value, onChange, style }: ScaleSelectorProps) {
  const cfg   = SCALE_CONFIG[type];
  const steps = Array.from({ length: cfg.max - cfg.min + 1 }, (_, i) => cfg.min + i);

  return (
    <View style={style}>
      <View style={scaleS.row}>
        {steps.map((step, idx) => {
          const selected = value === step;
          const accent   = cfg.colors[idx] ?? colors.primary;
          return (
            <TouchableOpacity
              key={step}
              onPress={() => onChange(step)}
              activeOpacity={0.78}
              style={[
                scaleS.btn,
                selected && { backgroundColor: accent, borderColor: accent },
              ]}
            >
              <Text style={scaleS.emoji}>{cfg.emoji[step as keyof typeof cfg.emoji] ?? step}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {/* Label for selected value */}
      <Text style={scaleS.selectedLabel}>
        {cfg.labels[value as keyof typeof cfg.labels] ?? ''}
      </Text>
    </View>
  );
}

const scaleS = StyleSheet.create({
  row:           { flexDirection: 'row', gap: spacing[2] },
  btn: {
    flex:            1,
    aspectRatio:     1,
    maxWidth:        52,
    alignItems:      'center',
    justifyContent:  'center',
    borderRadius:    radius.lg,
    borderWidth:     1.5,
    borderColor:     colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  emoji:         { fontSize: 22 },
  selectedLabel: {
    textAlign:   'center',
    marginTop:   spacing[2],
    fontSize:    fontSize.sm,
    color:       colors.textSecondary,
    fontWeight:  fontWeight.medium,
  },
});

// ─────────────────────────────────────────────────────────────
//  SYMPTOM GRID  (multi-select chips)
// ─────────────────────────────────────────────────────────────

const SYMPTOM_EMOJIS: Record<string, string> = {
  cramps:            '🌀',
  headache:          '🤕',
  fatigue:           '😴',
  bloating:          '🫧',
  breast_tenderness: '💜',
  mood_swings:       '🌈',
  spotting:          '💧',
  discharge:         '🔵',
  nausea:            '🤢',
  backache:          '🔙',
  acne:              '✨',
  insomnia:          '🌙',
  other:             '➕',
};

const ALL_SYMPTOMS = Object.keys(SYMPTOM_LABELS);

interface SymptomGridProps {
  selected: string[];
  onChange: (updated: string[]) => void;
  style?:   ViewStyle;
}

export function SymptomGrid({ selected, onChange, style }: SymptomGridProps) {
  function toggle(sym: string) {
    if (selected.includes(sym)) {
      onChange(selected.filter(s => s !== sym));
    } else {
      onChange([...selected, sym]);
    }
  }

  return (
    <View style={[symS.grid, style]}>
      {ALL_SYMPTOMS.map(sym => {
        const active = selected.includes(sym);
        return (
          <TouchableOpacity
            key={sym}
            onPress={() => toggle(sym)}
            activeOpacity={0.78}
            style={[symS.chip, active && symS.chipActive]}
          >
            <Text style={symS.chipEmoji}>{SYMPTOM_EMOJIS[sym] ?? '•'}</Text>
            <Text style={[symS.chipLabel, active && symS.chipLabelActive]} numberOfLines={2}>
              {SYMPTOM_LABELS[sym]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const symS = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing[2],
  },
  chip: {
    width:           '30%',
    flexGrow:        1,
    alignItems:      'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderRadius:    radius.xl,
    borderWidth:     1.5,
    borderColor:     colors.border,
    backgroundColor: colors.surfaceAlt,
    gap:             spacing[1],
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderColor:     colors.primary,
  },
  chipEmoji:      { fontSize: 22 },
  chipLabel: {
    fontSize:  fontSize.xs,
    color:     colors.textSecondary,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
  chipLabelActive: { color: colors.primary, fontWeight: fontWeight.semiBold },
});

// ─────────────────────────────────────────────────────────────
//  CALENDAR CELL
// ─────────────────────────────────────────────────────────────

interface CalendarCellProps {
  day:      CalendarDay | null;
  onPress?: (date: string) => void;
  size?:    number;
}

export function CalendarCell({ day, onPress, size = 40 }: CalendarCellProps) {
  if (!day) {
    return <View style={{ width: size, height: size }} />;
  }

  const isPeriod    = day.types.includes('period');
  const isPredicted = day.types.includes('predicted_period');
  const isOvulation = day.types.includes('ovulation');
  const isFertile   = day.types.includes('predicted_fertile');
  const isToday     = day.isToday;

  const bg =
    isPeriod    ? colors.phaseCycle :
    isPredicted ? colors.phaseCycle + '40' :
    isOvulation ? colors.fertile :
    isFertile   ? colors.fertileLight :
    isToday     ? colors.primaryLight :
    'transparent';

  const textColor =
    isPeriod    ? colors.textInverse :
    isOvulation ? colors.textInverse :
    isToday     ? colors.primary :
    day.isPast  ? colors.textTertiary :
    colors.textPrimary;

  const dayNum = parseInt(day.date.split('-')[2] ?? '0', 10);

  return (
    <TouchableOpacity
      onPress={onPress ? () => onPress(day.date) : undefined}
      disabled={!onPress}
      activeOpacity={0.78}
      style={[
        cellS.cell,
        { width: size, height: size, backgroundColor: bg },
        isToday && !isPeriod && { borderWidth: 1.5, borderColor: colors.primary },
      ]}
    >
      <Text style={[cellS.dayNum, { color: textColor }]}>{dayNum}</Text>

      {/* Bottom dots row */}
      {(day.hasSymptom || day.hasNote) && (
        <View style={cellS.dots}>
          {day.hasSymptom && <View style={[cellS.dot, { backgroundColor: colors.secondary }]} />}
          {day.hasNote    && <View style={[cellS.dot, { backgroundColor: colors.accent    }]} />}
        </View>
      )}
    </TouchableOpacity>
  );
}

const cellS = StyleSheet.create({
  cell: {
    borderRadius:   radius.full,
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
  },
  dayNum:  { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold },
  dots:    { position: 'absolute', bottom: 3, flexDirection: 'row', gap: 2 },
  dot:     { width: 4, height: 4, borderRadius: 2 },
});

// ─────────────────────────────────────────────────────────────
//  CALENDAR LEGEND
// ─────────────────────────────────────────────────────────────

export function CalendarLegend({ style }: { style?: ViewStyle }) {
  const items = [
    { color: colors.phaseCycle,             label: 'Règles'         },
    { color: colors.phaseCycle + '40',      label: 'Règles prévues' },
    { color: colors.fertile,                label: 'Ovulation'      },
    { color: colors.fertileLight,           label: 'Fenêtre fertile'},
    { color: colors.secondary,              label: 'Symptômes'      },
    { color: colors.accent,                 label: 'Note'           },
  ];

  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] }, style]}>
      {items.map(item => (
        <View key={item.label} style={legendS.item}>
          <View style={[legendS.dot, { backgroundColor: item.color }]} />
          <Text style={legendS.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const legendS = StyleSheet.create({
  item:  { flexDirection: 'row', alignItems: 'center', gap: spacing[1.5] },
  dot:   { width: 10, height: 10, borderRadius: 5 },
  label: { fontSize: fontSize.xs, color: colors.textSecondary },
});

// ─────────────────────────────────────────────────────────────
//  CYCLE ENTRY CARD  (for history list)
// ─────────────────────────────────────────────────────────────

interface CycleEntryCardProps {
  entry:    CycleEntry;
  onPress?: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}

export function CycleEntryCard({ entry, onPress, onDelete, showDelete }: CycleEntryCardProps) {
  const duration = entry.endDate
    ? Math.round((new Date(entry.endDate).getTime() - new Date(entry.startDate).getTime()) / 86_400_000) + 1
    : null;

  const flowCfg = FLOW_CONFIG.find(f => f.value === entry.flow);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.86}
      style={cardS.card}
    >
      <View style={[cardS.stripe, { backgroundColor: entry.flow ? (FLOW_CONFIG.find(f=>f.value===entry.flow)?.color ?? colors.phaseCycle) : colors.phaseCycle }]} />
      <View style={cardS.content}>
        <View style={cardS.top}>
          <View>
            <Text style={cardS.dateRange}>
              {fmtShort(entry.startDate)}
              {entry.endDate ? ` — ${fmtShort(entry.endDate)}` : ' (en cours)'}
            </Text>
            <View style={cardS.tags}>
              {duration && (
                <View style={[cardS.tag, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[cardS.tagText, { color: colors.primary }]}>{duration} jours</Text>
                </View>
              )}
              {flowCfg && (
                <View style={[cardS.tag, { backgroundColor: flowCfg.color + '22' }]}>
                  <Text style={[cardS.tagText, { color: flowCfg.color }]}>
                    {flowCfg.emoji} {flowCfg.label}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={cardS.right}>
            {entry.cycleLengthDays && (
              <Text style={cardS.cycleLen}>Cycle : {entry.cycleLengthDays} j</Text>
            )}
            {showDelete && onDelete && (
              <TouchableOpacity onPress={onDelete} hitSlop={8}>
                <Text style={{ fontSize: 18, color: colors.textTertiary }}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {entry.notes && (
          <Text style={cardS.notes} numberOfLines={2}>{entry.notes}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const FLOW_CONFIG = [
  { value: 'spotting', color: palette.rose200 },
  { value: 'light',    color: palette.rose300 },
  { value: 'medium',   color: palette.rose400 },
  { value: 'heavy',    color: palette.rose600 },
];

const cardS = StyleSheet.create({
  card: {
    flexDirection:   'row',
    backgroundColor: colors.surface,
    borderRadius:    radius.xl,
    overflow:        'hidden',
    ...shadows.sm,
    borderWidth:     1,
    borderColor:     colors.borderLight,
  },
  stripe:  { width: 5 },
  content: { flex: 1, padding: spacing[4] },
  top:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  dateRange: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[1] },
  tags:    { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' },
  tag:     { borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: 2 },
  tagText: { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },
  right:   { alignItems: 'flex-end', gap: spacing[1] },
  cycleLen: { fontSize: fontSize.xs, color: colors.textTertiary },
  notes:   { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing[2] },
});

// ─────────────────────────────────────────────────────────────
//  SYMPTOM ENTRY CARD
// ─────────────────────────────────────────────────────────────

interface SymptomEntryCardProps {
  entry:    SymptomEntry;
  onPress?: () => void;
}

export function SymptomEntryCard({ entry, onPress }: SymptomEntryCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.86}
      style={symCardS.card}
    >
      <View style={symCardS.header}>
        <Text style={symCardS.date}>{dayLabel(entry.date)}</Text>
        <View style={symCardS.moodBadge}>
          <Text style={{ fontSize: 18 }}>{MOOD_EMOJIS[entry.mood]}</Text>
          <Text style={symCardS.moodLabel}>{MOOD_LABELS[entry.mood]}</Text>
        </View>
      </View>

      {entry.symptoms.length > 0 && (
        <View style={symCardS.symRow}>
          {entry.symptoms.slice(0, 5).map(sym => (
            <View key={sym} style={symCardS.symChip}>
              <Text style={symCardS.symEmoji}>{SYMPTOM_EMOJIS[sym] ?? '•'}</Text>
              <Text style={symCardS.symLabel}>{SYMPTOM_LABELS[sym] ?? sym}</Text>
            </View>
          ))}
          {entry.symptoms.length > 5 && (
            <Text style={symCardS.more}>+{entry.symptoms.length - 5}</Text>
          )}
        </View>
      )}

      {entry.notes && (
        <Text style={symCardS.notes} numberOfLines={2}>{entry.notes}</Text>
      )}
    </TouchableOpacity>
  );
}

const symCardS = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius:    radius.xl,
    padding:         spacing[4],
    ...shadows.sm,
    borderWidth:     1,
    borderColor:     colors.borderLight,
    gap:             spacing[3],
  },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date:      { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  moodBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  moodLabel: { fontSize: fontSize.xs, color: colors.textSecondary },
  symRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  symChip: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing[1],
    backgroundColor: colors.primaryLight,
    borderRadius:    radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical:   spacing[0.5],
  },
  symEmoji: { fontSize: 14 },
  symLabel: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.medium },
  more:     { fontSize: fontSize.xs, color: colors.textTertiary, alignSelf: 'center' },
  notes:    { fontSize: fontSize.sm, color: colors.textSecondary },
});

// ─────────────────────────────────────────────────────────────
//  SECTION HEADER
// ─────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title:        string;
  actionLabel?: string;
  onAction?:    () => void;
  style?:       ViewStyle;
}

export function SectionHeader({ title, actionLabel, onAction, style }: SectionHeaderProps) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, style]}>
      <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary }}>
        {title}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={{ fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semiBold }}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  EMPTY STATE
// ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  emoji:       string;
  title:       string;
  subtitle?:   string;
  actionLabel?: string;
  onAction?:   () => void;
}

export function EmptyState({ emoji, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing[12], gap: spacing[3] }}>
      <Text style={{ fontSize: 48 }}>{emoji}</Text>
      <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, textAlign: 'center' }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', maxWidth: 280 }}>
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={{
            marginTop:         spacing[2],
            backgroundColor:   colors.primary,
            borderRadius:      radius.full,
            paddingVertical:   spacing[3],
            paddingHorizontal: spacing[7],
            ...shadows.colored,
          }}
        >
          <Text style={{ color: colors.textInverse, fontSize: fontSize.base, fontWeight: fontWeight.semiBold }}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
