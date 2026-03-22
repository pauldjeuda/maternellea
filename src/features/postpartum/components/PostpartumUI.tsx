/**
 * features/postpartum/components/PostpartumUI.tsx
 *
 * Shared components for postpartum + baby modules.
 *
 * Exports:
 *   MoodScaleRow         – horizontal 1–5 mood picker
 *   FatigueScaleRow      – horizontal 1–5 fatigue picker
 *   PainScaleRow         – horizontal 0–5 pain picker
 *   SymptomChips         – postpartum multi-select symptom grid
 *   PostpartumEntryCard  – list item for a daily entry
 *   BabyAvatarHeader     – baby name + age + avatar hero block
 *   GrowthStatCard       – single metric stat (weight/height/head)
 *   GrowthChart          – pure RN SVG line chart
 *   GrowthEntryRow       – history list item
 *   HealthNoteCard       – health note list item with category color
 *   SectionHeader        – consistent section title
 *   EmptyCard            – empty state
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ViewStyle,
} from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';

import { tokens } from '@theme/tokens';
import {
  POSTPARTUM_SYMPTOM_LABELS, MOOD_EMOJIS, MOOD_LABELS,
  FATIGUE_LABELS, PAIN_LABELS, GENDER_EMOJIS,
} from '@constants';
import { fmt, fmtShort, dayLabel } from '@utils/date';
import { HEALTH_NOTE_CATEGORIES } from '../types';
import type { PostpartumEntry, GrowthEntry, BabyProfile } from '@types/models';
import type { HealthNote, BabyAge } from '../types';

const { colors, spacing, radius, fontSize, fontWeight, shadows, palette } = tokens;

// ─────────────────────────────────────────────────────────────
//  SCALE ROW  (mood / fatigue / pain — horizontal buttons)
// ─────────────────────────────────────────────────────────────

interface ScaleRowProps {
  value:    number;
  onChange: (v: number) => void;
  type:     'mood' | 'fatigue' | 'pain';
  style?:   ViewStyle;
}

const SCALE_CFG = {
  mood: {
    steps:  [1,2,3,4,5],
    emojis: MOOD_EMOJIS,
    labels: MOOD_LABELS,
    colors: [palette.red400, palette.peach400, palette.amber400, palette.sage400, palette.green500],
  },
  fatigue: {
    steps:  [1,2,3,4,5],
    emojis: { 1:'⚡',2:'🔋',3:'😶',4:'😩',5:'💀' } as Record<number,string>,
    labels: FATIGUE_LABELS,
    colors: [palette.green500, palette.sage400, palette.amber400, palette.peach400, palette.red400],
  },
  pain: {
    steps:  [0,1,2,3,4,5],
    emojis: { 0:'✨',1:'🤏',2:'😐',3:'😣',4:'😖',5:'🆘' } as Record<number,string>,
    labels: PAIN_LABELS,
    colors: [palette.green500, palette.sage300, palette.amber400, palette.peach400, palette.red400, palette.red500],
  },
} as const;

export function ScaleRow({ value, onChange, type, style }: ScaleRowProps) {
  const cfg = SCALE_CFG[type];
  return (
    <View style={style}>
      <View style={{ flexDirection: 'row', gap: spacing[2] }}>
        {cfg.steps.map((step, idx) => {
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
              <Text style={scaleS.emoji}>{cfg.emojis[step as keyof typeof cfg.emojis]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={scaleS.label}>{cfg.labels[value as keyof typeof cfg.labels]}</Text>
    </View>
  );
}

const scaleS = StyleSheet.create({
  btn: {
    flex: 1, aspectRatio: 1, maxWidth: 52,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceAlt,
  },
  emoji: { fontSize: 22 },
  label: { textAlign: 'center', marginTop: spacing[2], fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
});

// ─────────────────────────────────────────────────────────────
//  SYMPTOM CHIPS  (postpartum)
// ─────────────────────────────────────────────────────────────

const SYMPTOM_EMOJIS: Record<string, string> = {
  perineal_pain: '🩹', breast_engorgement: '🤱', mastitis: '🔥',
  baby_blues: '😢', insomnia: '🌙', fatigue: '😴',
  anxiety: '😰', hair_loss: '💇', night_sweats: '💧',
  incontinence: '🚿', other: '➕',
};

interface SymptomChipsProps {
  selected: string[];
  onChange: (v: string[]) => void;
  style?:   ViewStyle;
}

export function SymptomChips({ selected, onChange, style }: SymptomChipsProps) {
  function toggle(sym: string) {
    onChange(selected.includes(sym) ? selected.filter(s => s !== sym) : [...selected, sym]);
  }
  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }, style]}>
      {Object.keys(POSTPARTUM_SYMPTOM_LABELS).map(sym => {
        const active = selected.includes(sym);
        return (
          <TouchableOpacity key={sym} onPress={() => toggle(sym)} activeOpacity={0.78}
            style={[chipS.chip, active && chipS.chipActive]}
          >
            <Text style={chipS.emoji}>{SYMPTOM_EMOJIS[sym] ?? '•'}</Text>
            <Text style={[chipS.label, active && chipS.labelActive]}>
              {POSTPARTUM_SYMPTOM_LABELS[sym]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const chipS = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1.5],
    paddingVertical: spacing[2], paddingHorizontal: spacing[3],
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceAlt,
  },
  chipActive:  { backgroundColor: colors.accentLight, borderColor: colors.accent },
  emoji:       { fontSize: 14 },
  label:       { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
  labelActive: { color: colors.accent, fontWeight: fontWeight.semiBold },
});

// ─────────────────────────────────────────────────────────────
//  POSTPARTUM ENTRY CARD
// ─────────────────────────────────────────────────────────────

interface PostpartumEntryCardProps {
  entry:    PostpartumEntry;
  onPress?: () => void;
}

export function PostpartumEntryCard({ entry, onPress }: PostpartumEntryCardProps) {
  const moodColor = [
    '', palette.red400, palette.peach400, palette.amber400, palette.sage400, palette.green500,
  ][entry.mood] ?? colors.primary;

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.86}
      style={ppS.card}
    >
      <View style={ppS.header}>
        <View style={{ gap: spacing[0.5] }}>
          <Text style={ppS.date}>{dayLabel(entry.date)}</Text>
          <Text style={ppS.dateSmall}>{fmt(entry.date, 'd MMMM')}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: spacing[1] }}>
          <Text style={{ fontSize: 24 }}>{MOOD_EMOJIS[entry.mood]}</Text>
          <Text style={[ppS.moodLabel, { color: moodColor }]}>{MOOD_LABELS[entry.mood]}</Text>
        </View>
      </View>

      {/* Indicators row */}
      <View style={ppS.indicators}>
        <View style={ppS.indicator}>
          <Text style={ppS.indicLabel}>Fatigue</Text>
          <View style={ppS.indicBar}>
            {[1,2,3,4,5].map(i => (
              <View key={i} style={[ppS.indicDot, { backgroundColor: i <= entry.fatigue ? palette.amber400 : colors.borderLight }]} />
            ))}
          </View>
        </View>
        <View style={ppS.indicator}>
          <Text style={ppS.indicLabel}>Douleur</Text>
          <View style={ppS.indicBar}>
            {[1,2,3,4,5].map(i => (
              <View key={i} style={[ppS.indicDot, { backgroundColor: i <= entry.pain ? palette.red400 : colors.borderLight }]} />
            ))}
          </View>
        </View>
        {entry.isBreastfeeding && (
          <View style={ppS.bfBadge}>
            <Text style={{ fontSize: 13 }}>🤱</Text>
            <Text style={ppS.bfText}>Allaitement</Text>
          </View>
        )}
      </View>

      {/* Symptoms */}
      {entry.symptoms.length > 0 && (
        <View style={ppS.symptoms}>
          {entry.symptoms.slice(0, 4).map(sym => (
            <View key={sym} style={ppS.symChip}>
              <Text style={{ fontSize: 11 }}>{SYMPTOM_EMOJIS[sym] ?? '•'}</Text>
              <Text style={ppS.symLabel}>{POSTPARTUM_SYMPTOM_LABELS[sym] ?? sym}</Text>
            </View>
          ))}
          {entry.symptoms.length > 4 && (
            <Text style={ppS.symMore}>+{entry.symptoms.length - 4}</Text>
          )}
        </View>
      )}

      {entry.notes && (
        <Text style={ppS.notes} numberOfLines={3}>{entry.notes}</Text>
      )}
    </TouchableOpacity>
  );
}

const ppS = StyleSheet.create({
  card:        { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[4], gap: spacing[3], ...shadows.xs, borderWidth: 1, borderColor: colors.borderLight },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  date:        { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary },
  dateSmall:   { fontSize: fontSize.xs, color: colors.textTertiary, textTransform: 'capitalize' },
  moodLabel:   { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },
  indicators:  { flexDirection: 'row', alignItems: 'center', gap: spacing[5] },
  indicator:   { gap: spacing[1] },
  indicLabel:  { fontSize: fontSize['2xs'], color: colors.textTertiary, fontWeight: fontWeight.medium },
  indicBar:    { flexDirection: 'row', gap: 3 },
  indicDot:    { width: 8, height: 8, borderRadius: 4 },
  bfBadge:     { flexDirection: 'row', alignItems: 'center', gap: spacing[1], backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: 2 },
  bfText:      { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.medium },
  symptoms:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1.5] },
  symChip:     { flexDirection: 'row', alignItems: 'center', gap: spacing[1], backgroundColor: colors.surfaceAlt, borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: 2 },
  symLabel:    { fontSize: fontSize['2xs'], color: colors.textSecondary },
  symMore:     { fontSize: fontSize.xs, color: colors.textTertiary, alignSelf: 'center' },
  notes:       { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: fontSize.sm * 1.6, fontStyle: 'italic' },
});

// ─────────────────────────────────────────────────────────────
//  BABY AVATAR HEADER
// ─────────────────────────────────────────────────────────────

interface BabyAvatarHeaderProps {
  baby:    BabyProfile;
  babyAge: BabyAge | null;
  style?:  ViewStyle;
}

export function BabyAvatarHeader({ baby, babyAge, style }: BabyAvatarHeaderProps) {
  const emoji = GENDER_EMOJIS[baby.gender] ?? '🍼';
  const accent = baby.gender === 'female' ? colors.primary :
                 baby.gender === 'male'   ? colors.secondary : colors.accent;

  return (
    <View style={[babyH.wrap, { backgroundColor: accent + '0E', borderColor: accent + '22' }, style]}>
      <View style={[babyH.avatar, { backgroundColor: accent + '22' }]}>
        <Text style={{ fontSize: 40 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1, gap: spacing[1] }}>
        <Text style={babyH.name}>{baby.name}</Text>
        {babyAge && (
          <Text style={[babyH.age, { color: accent }]}>{babyAge.label}</Text>
        )}
        <Text style={babyH.birth}>Née le {fmt(baby.birthDate, 'd MMMM yyyy')}</Text>
      </View>
    </View>
  );
}

const babyH = StyleSheet.create({
  wrap:   { flexDirection: 'row', alignItems: 'center', gap: spacing[4], borderRadius: radius['2xl'], padding: spacing[5], borderWidth: 1.5 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  name:   { fontSize: fontSize['2xl'], fontWeight: fontWeight.extraBold, color: colors.textPrimary, letterSpacing: -0.5 },
  age:    { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  birth:  { fontSize: fontSize.xs, color: colors.textTertiary },
});

// ─────────────────────────────────────────────────────────────
//  GROWTH STAT CARD
// ─────────────────────────────────────────────────────────────

export function GrowthStatCard({ icon, label, value, unit, gain, accent, style }: {
  icon: string; label: string; value: number; unit: string;
  gain?: number; accent: string; style?: ViewStyle;
}) {
  return (
    <View style={[gscS.card, { borderColor: accent + '33' }, style]}>
      <Text style={gscS.icon}>{icon}</Text>
      <Text style={gscS.label}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing[0.5] }}>
        <Text style={[gscS.value, { color: accent }]}>{value < 1000 ? value : (value / 1000).toFixed(2).replace('.', ',')}</Text>
        <Text style={[gscS.unit, { color: accent + 'BB' }]}>{value >= 1000 ? 'kg' : unit}</Text>
      </View>
      {gain !== undefined && (
        <Text style={[gscS.gain, { color: gain >= 0 ? colors.success : colors.error }]}>
          {gain >= 0 ? '+' : ''}{gain < -999 || gain > 999 ? `${(gain/1000).toFixed(2).replace('.',',')} kg` : `${gain} ${unit}`}
        </Text>
      )}
    </View>
  );
}

const gscS = StyleSheet.create({
  card:  { flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[4], gap: spacing[1], borderWidth: 1.5, ...shadows.xs },
  icon:  { fontSize: 24 },
  label: { fontSize: fontSize.xs, color: colors.textTertiary, fontWeight: fontWeight.medium, textAlign: 'center' },
  value: { fontSize: fontSize.xl, fontWeight: fontWeight.extraBold },
  unit:  { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold },
  gain:  { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },
});

// ─────────────────────────────────────────────────────────────
//  GROWTH LINE CHART  (pure RN + SVG)
// ─────────────────────────────────────────────────────────────

interface GrowthChartProps {
  data:   GrowthEntry[];
  metric: 'weight' | 'height' | 'head';
  color:  string;
  width:  number;
  height: number;
}

export function GrowthChart({ data, metric, color, width, height }: GrowthChartProps) {
  if (data.length < 2) return null;

  const values = data.map(d =>
    metric === 'weight' ? d.weightGrams / 1000 :
    metric === 'height' ? d.heightCm :
    (d.headCircumferenceCm ?? 0)
  ).filter(v => v > 0);

  if (values.length < 2) return null;

  const labels  = data.map(d => d.ageMonths);
  const minV    = Math.min(...values) * 0.96;
  const maxV    = Math.max(...values) * 1.04;
  const range   = maxV - minV || 1;
  const padH    = 28;
  const padV    = 16;
  const chartW  = width  - padH * 2;
  const chartH  = height - padV * 2;

  const pts = values.map((v, i) => ({
    x: padH + (i / (values.length - 1)) * chartW,
    y: padV + chartH - ((v - minV) / range) * chartH,
    label: String(labels[i] ?? i),
    value: v,
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  return (
    <Svg width={width} height={height} style={{ overflow: 'visible' }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(pct => (
        <Line key={pct}
          x1={padH} y1={padV + chartH * (1 - pct)}
          x2={padH + chartW} y2={padV + chartH * (1 - pct)}
          stroke={colors.border} strokeWidth={0.5}
        />
      ))}

      {/* Area fill */}
      <Path
        d={`${pathD} L ${pts[pts.length - 1]!.x.toFixed(1)} ${(padV + chartH).toFixed(1)} L ${pts[0]!.x.toFixed(1)} ${(padV + chartH).toFixed(1)} Z`}
        fill={color + '15'}
      />

      {/* Line */}
      <Path d={pathD} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points */}
      {pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={4} fill={color} stroke={colors.surface} strokeWidth={2} />
      ))}

      {/* X-axis labels */}
      {pts.map((p, i) => (
        <SvgText key={`xl${i}`} x={p.x} y={height - 2} fontSize={9} fill={colors.textTertiary} textAnchor="middle">
          {p.label}m
        </SvgText>
      ))}
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────
//  GROWTH ENTRY ROW
// ─────────────────────────────────────────────────────────────

export function GrowthEntryRow({ entry, onPress, onDelete }: {
  entry: GrowthEntry; onPress?: () => void; onDelete?: () => void;
}) {
  const wKg = (entry.weightGrams / 1000).toFixed(2).replace('.', ',');
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.86} style={grS.row}>
      <View style={grS.left}>
        <Text style={grS.date}>{fmtShort(entry.date)}</Text>
        <Text style={grS.age}>{entry.ageMonths} mois</Text>
      </View>
      <View style={grS.metrics}>
        <View style={grS.metric}><Text style={grS.metricValue}>{wKg} kg</Text></View>
        <View style={grS.metric}><Text style={grS.metricValue}>{entry.heightCm} cm</Text></View>
        {entry.headCircumferenceCm && (
          <View style={grS.metric}><Text style={grS.metricValue}>{entry.headCircumferenceCm} cm PC</Text></View>
        )}
      </View>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} hitSlop={8} style={{ paddingLeft: spacing[2] }}>
          <Text style={{ fontSize: 16, color: colors.textTertiary }}>🗑️</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const grS = StyleSheet.create({
  row:         { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing[3] },
  left:        { width: 64, gap: spacing[0.5] },
  date:        { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textPrimary },
  age:         { fontSize: fontSize.xs, color: colors.textTertiary },
  metrics:     { flex: 1, flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' },
  metric:      { backgroundColor: colors.surfaceAlt, borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: spacing[0.5] },
  metricValue: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
});

// ─────────────────────────────────────────────────────────────
//  HEALTH NOTE CARD
// ─────────────────────────────────────────────────────────────

export function HealthNoteCard({ note, onPress, onDelete }: {
  note: HealthNote; onPress?: () => void; onDelete?: () => void;
}) {
  const cat = HEALTH_NOTE_CATEGORIES[note.category];
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.86} style={hnS.card}>
      <View style={[hnS.stripe, { backgroundColor: cat.color }]} />
      <View style={hnS.body}>
        <View style={hnS.header}>
          <View style={[hnS.catBadge, { backgroundColor: cat.color + '1A' }]}>
            <Text style={{ fontSize: 13 }}>{cat.emoji}</Text>
            <Text style={[hnS.catLabel, { color: cat.color }]}>{cat.label}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
            <Text style={hnS.date}>{fmtShort(note.date)}</Text>
            {onDelete && (
              <TouchableOpacity onPress={onDelete} hitSlop={8}>
                <Text style={{ fontSize: 15, color: colors.textTertiary }}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={hnS.content} numberOfLines={4}>{note.content}</Text>
      </View>
    </TouchableOpacity>
  );
}

const hnS = StyleSheet.create({
  card:     { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...shadows.xs, borderWidth: 1, borderColor: colors.borderLight },
  stripe:   { width: 4 },
  body:     { flex: 1, padding: spacing[4], gap: spacing[2] },
  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing[1.5], borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: spacing[0.5] },
  catLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },
  date:     { fontSize: fontSize.xs, color: colors.textTertiary },
  content:  { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: fontSize.sm * 1.6 },
});

// ─────────────────────────────────────────────────────────────
//  SECTION HEADER + EMPTY CARD
// ─────────────────────────────────────────────────────────────

export function SectionHeader({
  title, actionLabel, onAction, style,
}: { title: string; actionLabel?: string; onAction?: () => void; style?: ViewStyle }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, style]}>
      <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary }}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.phasePostpartum }}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function EmptyCard({ emoji, title, subtitle, onAction, actionLabel }: {
  emoji: string; title: string; subtitle?: string; onAction?: () => void; actionLabel?: string;
}) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing[10], gap: spacing[3] }}>
      <Text style={{ fontSize: 44 }}>{emoji}</Text>
      <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, textAlign: 'center' }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', maxWidth: 260 }}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} style={{ backgroundColor: colors.phasePostpartum, borderRadius: radius.full, paddingVertical: spacing[3], paddingHorizontal: spacing[7], marginTop: spacing[2], ...shadows.sm }}>
          <Text style={{ color: colors.textInverse, fontWeight: fontWeight.semiBold, fontSize: fontSize.base }}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
