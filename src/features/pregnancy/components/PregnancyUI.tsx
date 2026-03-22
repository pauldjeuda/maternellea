/**
 * features/pregnancy/components/PregnancyUI.tsx
 *
 * Shared presentational components for the pregnancy module.
 *
 * Exports:
 *   ProgressRing         – SVG circular progress indicator
 *   TrimesterBar         – horizontal trimester progress
 *   WeekBadge            – SA badge chip
 *   AppointmentCard      – full appointment list item
 *   ExamCard             – medical exam list item
 *   JournalEntryCard     – journal entry card
 *   WeightSparkline      – mini weight trend chart (pure RN)
 *   ChecklistRow         – single checklist item
 *   SectionHeader        – consistent section header
 *   EmptyCard            – empty state inside a card
 *   FormField            – consistent form field wrapper
 *   FormLabel            – consistent label
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ViewStyle, TextStyle,
} from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';

import { tokens } from '@theme/tokens';
import { MOOD_EMOJIS, MOOD_LABELS, TRIMESTER_LABELS } from '@constants';
import { fmt, fmtShort, fmtDateTime, dayLabel, daysUntil } from '@utils/date';
import { CHECKLIST_CATEGORY_META } from '../utils/pregnancyCalc';
import type { Appointment, MedicalExam, PregnancyJournalEntry } from '@types/models';
import type { ChecklistItem } from '../types';

const { colors, spacing, radius, fontSize, fontWeight, shadows, palette } = tokens;

// ─────────────────────────────────────────────────────────────
//  PROGRESS RING  (SVG, no external deps)
// ─────────────────────────────────────────────────────────────

interface ProgressRingProps {
  pct:      number;   // 0–100
  size:     number;
  stroke:   number;
  color:    string;
  bg?:      string;
  children?: React.ReactNode;
}

export function ProgressRing({ pct, size, stroke, color, bg, children }: ProgressRingProps) {
  const r          = (size - stroke) / 2;
  const cx         = size / 2;
  const cy         = size / 2;
  const circ       = 2 * Math.PI * r;
  const dashOffset = circ * (1 - Math.min(1, pct / 100));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Track */}
        <Circle
          cx={cx} cy={cy} r={r}
          stroke={bg ?? color + '22'}
          strokeWidth={stroke}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={cx} cy={cy} r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      {children}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  TRIMESTER BAR
// ─────────────────────────────────────────────────────────────

interface TrimesterBarProps {
  currentWeek: number;
  color:       string;
  style?:      ViewStyle;
}

export function TrimesterBar({ currentWeek, color, style }: TrimesterBarProps) {
  const pct = Math.min(100, (currentWeek / 40) * 100);

  return (
    <View style={style}>
      <View style={tbS.track}>
        {/* T1 */}
        <View style={[tbS.segment, { flex: 13, backgroundColor: colors.fertileLight }]} />
        {/* T2 */}
        <View style={[tbS.segment, { flex: 13, backgroundColor: colors.secondaryLight, marginHorizontal: 2 }]} />
        {/* T3 */}
        <View style={[tbS.segment, { flex: 14, backgroundColor: colors.primaryLight }]} />
        {/* Fill overlay */}
        <View style={[tbS.fill, { width: `${pct}%`, backgroundColor: color }]} />
        {/* Cursor */}
        <View style={[tbS.cursor, { left: `${pct}%`, borderColor: color }]} />
      </View>
      <View style={tbS.labels}>
        <Text style={tbS.label}>T1</Text>
        <Text style={tbS.label}>T2</Text>
        <Text style={tbS.label}>T3</Text>
      </View>
    </View>
  );
}

const tbS = StyleSheet.create({
  track:  { height: 10, borderRadius: radius.full, flexDirection: 'row', overflow: 'visible', position: 'relative' },
  segment: { height: 10, borderRadius: radius.full },
  fill: {
    position: 'absolute', left: 0, top: 0, height: 10,
    borderRadius: radius.full, opacity: 0.7,
  },
  cursor: {
    position: 'absolute', top: -3, marginLeft: -8,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.surface, borderWidth: 2.5,
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing[2] },
  label:  { fontSize: fontSize.xs, color: colors.textTertiary, fontWeight: fontWeight.medium },
});

// ─────────────────────────────────────────────────────────────
//  WEEK BADGE
// ─────────────────────────────────────────────────────────────

export function WeekBadge({ week, color }: { week: number; color: string }) {
  return (
    <View style={{ backgroundColor: color + '1A', borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: spacing[0.5] }}>
      <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color }}>SA {week}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  APPOINTMENT CARD
// ─────────────────────────────────────────────────────────────

interface AppointmentCardProps {
  apt:       Appointment;
  onPress?:  () => void;
  onComplete?: () => void;
  compact?:  boolean;
}

export function AppointmentCard({ apt, onPress, onComplete, compact }: AppointmentCardProps) {
  const days    = daysUntil(apt.date);
  const isPast  = apt.isCompleted || days === 0 && new Date(apt.date) < new Date();
  const isUrgent = !apt.isCompleted && days <= 2;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.86}
      style={[
        aptS.card,
        apt.isCompleted && aptS.cardDone,
        isUrgent && { borderColor: colors.warning + '66', borderWidth: 1.5 },
      ]}
    >
      <View style={[aptS.stripe, {
        backgroundColor: apt.isCompleted ? colors.success :
                         isUrgent        ? colors.warning  : colors.phasePregnancy,
      }]} />

      <View style={aptS.body}>
        <View style={aptS.row}>
          <View style={{ flex: 1 }}>
            <Text style={[aptS.title, apt.isCompleted && { color: colors.textTertiary }]}>
              {apt.title}
            </Text>
            {apt.doctorName && (
              <Text style={aptS.meta}>{apt.doctorName}{apt.speciality ? ` · ${apt.speciality}` : ''}</Text>
            )}
          </View>

          <View style={aptS.dateBadge}>
            {apt.isCompleted ? (
              <Text style={[aptS.dateText, { color: colors.success }]}>✓ Fait</Text>
            ) : (
              <>
                <Text style={[aptS.dateText, { color: isUrgent ? colors.warning : colors.phasePregnancy }]}>
                  {days === 0 ? "Aujourd'hui" : days === 1 ? 'Demain' : `J − ${days}`}
                </Text>
                <Text style={aptS.dateSub}>{fmtShort(apt.date)}</Text>
              </>
            )}
          </View>
        </View>

        {!compact && (
          <View style={aptS.details}>
            <Text style={aptS.time}>🕐 {fmtDateTime(apt.date)}</Text>
            {apt.location && <Text style={aptS.location} numberOfLines={1}>📍 {apt.location}</Text>}
            {apt.notes    && <Text style={aptS.notes} numberOfLines={2}>{apt.notes}</Text>}
          </View>
        )}

        {!apt.isCompleted && onComplete && (
          <TouchableOpacity onPress={onComplete} style={aptS.completeBtn}>
            <Text style={aptS.completeBtnText}>Marquer comme effectué</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const aptS = StyleSheet.create({
  card: {
    flexDirection:   'row',
    backgroundColor: colors.surface,
    borderRadius:    radius.xl,
    overflow:        'hidden',
    ...shadows.sm,
    borderWidth:     1,
    borderColor:     colors.borderLight,
  },
  cardDone: { opacity: 0.7 },
  stripe:   { width: 5 },
  body:     { flex: 1, padding: spacing[4], gap: spacing[2] },
  row:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing[3] },
  title:    { fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.textPrimary, lineHeight: fontSize.base * 1.3 },
  meta:     { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 },
  dateBadge: { alignItems: 'flex-end', minWidth: 70, gap: 2 },
  dateText:  { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  dateSub:   { fontSize: fontSize.xs, color: colors.textTertiary },
  details:   { gap: spacing[1] },
  time:      { fontSize: fontSize.sm, color: colors.textSecondary },
  location:  { fontSize: fontSize.sm, color: colors.textSecondary },
  notes:     { fontSize: fontSize.sm, color: colors.textTertiary, fontStyle: 'italic', marginTop: spacing[1] },
  completeBtn: {
    alignSelf:         'flex-start',
    marginTop:         spacing[2],
    paddingVertical:   spacing[1.5],
    paddingHorizontal: spacing[3],
    backgroundColor:   colors.successLight,
    borderRadius:      radius.full,
  },
  completeBtnText: { fontSize: fontSize.xs, color: colors.successText, fontWeight: fontWeight.semiBold },
});

// ─────────────────────────────────────────────────────────────
//  EXAM CARD
// ─────────────────────────────────────────────────────────────

interface ExamCardProps {
  exam:      MedicalExam;
  onPress?:  () => void;
}

export function ExamCard({ exam, onPress }: ExamCardProps) {
  const days    = exam.isCompleted ? 0 : daysUntil(exam.scheduledDate);
  const isUrgent = !exam.isCompleted && days <= 7;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.86}
      style={[examS.card, exam.isCompleted && examS.cardDone]}
    >
      <View style={[examS.icon, {
        backgroundColor: exam.isCompleted ? colors.successLight :
                         isUrgent         ? colors.warningLight  : colors.secondaryLight,
      }]}>
        <Text style={{ fontSize: 20 }}>{exam.isCompleted ? '✅' : '🔬'}</Text>
      </View>
      <View style={{ flex: 1, gap: spacing[0.5] }}>
        <Text style={examS.type} numberOfLines={2}>{exam.type}</Text>
        {exam.labName    && <Text style={examS.meta}>{exam.labName}</Text>}
        {exam.doctorName && <Text style={examS.meta}>{exam.doctorName}</Text>}
        <Text style={exam.isCompleted ? examS.dateDone : examS.date}>
          {exam.isCompleted
            ? `Effectué le ${fmtShort(exam.completedDate ?? exam.scheduledDate)}`
            : `Prévu le ${fmtShort(exam.scheduledDate)} · ${days === 0 ? "Aujourd'hui" : `dans ${days}j`}`}
        </Text>
        {exam.result && (
          <Text style={examS.result} numberOfLines={2}>
            💬 {exam.result}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const examS = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3],
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[4],
    ...shadows.xs, borderWidth: 1, borderColor: colors.borderLight,
  },
  cardDone: { opacity: 0.75 },
  icon: { width: 42, height: 42, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  type: { fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.textPrimary },
  meta: { fontSize: fontSize.xs, color: colors.textTertiary },
  date: { fontSize: fontSize.xs, color: colors.secondary, fontWeight: fontWeight.medium },
  dateDone: { fontSize: fontSize.xs, color: colors.successText, fontWeight: fontWeight.medium },
  result: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing[1] },
});

// ─────────────────────────────────────────────────────────────
//  JOURNAL ENTRY CARD
// ─────────────────────────────────────────────────────────────

interface JournalEntryCardProps {
  entry:    PregnancyJournalEntry;
  onPress?: () => void;
  compact?: boolean;
}

export function JournalEntryCard({ entry, onPress, compact }: JournalEntryCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.86}
      style={jrnS.card}
    >
      <View style={jrnS.header}>
        <View style={{ gap: spacing[0.5] }}>
          <Text style={jrnS.date}>{fmt(entry.date, 'EEEE d MMMM')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
            <Text style={jrnS.week}>SA {entry.week}</Text>
            {entry.mood && (
              <Text style={jrnS.mood}>{MOOD_EMOJIS[entry.mood]} {MOOD_LABELS[entry.mood]}</Text>
            )}
          </View>
        </View>
        <Text style={{ fontSize: 22 }}>{MOOD_EMOJIS[entry.mood] ?? '😊'}</Text>
      </View>

      <Text
        style={[jrnS.content, compact && { numberOfLines: 3 } as any]}
        numberOfLines={compact ? 3 : undefined}
      >
        {entry.content}
      </Text>

      {entry.tags && entry.tags.length > 0 && (
        <View style={jrnS.tags}>
          {entry.tags.map(tag => (
            <View key={tag} style={jrnS.tag}>
              <Text style={jrnS.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const jrnS = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[5],
    ...shadows.sm, borderWidth: 1, borderColor: colors.borderLight, gap: spacing[3],
  },
  header:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  date:    { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary, textTransform: 'capitalize' },
  week:    { fontSize: fontSize.xs, color: colors.phasePregnancy, fontWeight: fontWeight.semiBold, backgroundColor: colors.secondaryLight, borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: 2 },
  mood:    { fontSize: fontSize.xs, color: colors.textTertiary },
  content: { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: fontSize.base * 1.65 },
  tags:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  tag: {
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingHorizontal: spacing[2], paddingVertical: spacing[0.5],
  },
  tagText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.medium },
});

// ─────────────────────────────────────────────────────────────
//  WEIGHT SPARKLINE  (pure RN — no chart library needed for mini)
// ─────────────────────────────────────────────────────────────

interface WeightSparklineProps {
  data:   { kg: number }[];
  width:  number;
  height: number;
  color:  string;
}

export function WeightSparkline({ data, width, height, color }: WeightSparklineProps) {
  if (data.length < 2) return null;

  const kgs  = data.map(d => d.kg);
  const minV = Math.min(...kgs);
  const maxV = Math.max(...kgs);
  const range = maxV - minV || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.kg - minV) / range) * height;
    return { x, y };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Path d={pathD} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────
//  CHECKLIST ROW
// ─────────────────────────────────────────────────────────────

interface ChecklistRowProps {
  item:     ChecklistItem;
  onToggle: () => void;
}

export function ChecklistRow({ item, onToggle }: ChecklistRowProps) {
  const meta = CHECKLIST_CATEGORY_META[item.category];

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      style={[clS.row, item.isDone && clS.rowDone]}
    >
      <View style={[clS.checkbox, item.isDone && clS.checkboxDone]}>
        {item.isDone && <Text style={clS.checkmark}>✓</Text>}
      </View>

      <View style={{ flex: 1, gap: spacing[0.5] }}>
        <Text style={[clS.label, item.isDone && clS.labelDone]}>
          {item.label}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
          <View style={[clS.catBadge, { backgroundColor: meta.color + '1A' }]}>
            <Text style={{ fontSize: 11 }}>{meta.emoji}</Text>
            <Text style={[clS.catLabel, { color: meta.color }]}>{meta.label}</Text>
          </View>
          {item.isRequired && (
            <View style={clS.requiredBadge}>
              <Text style={clS.requiredText}>Recommandé</Text>
            </View>
          )}
          <Text style={clS.weekRange}>SA {item.weekFrom}–{item.weekTo}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const clS = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  rowDone:   { opacity: 0.65 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkmark:    { color: colors.textInverse, fontSize: 13, fontWeight: fontWeight.bold },
  label:        { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary, lineHeight: fontSize.sm * 1.4 },
  labelDone:    { textDecorationLine: 'line-through', color: colors.textTertiary },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: 2 },
  catLabel: { fontSize: fontSize['2xs'], fontWeight: fontWeight.semiBold },
  requiredBadge: { backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: 2 },
  requiredText:  { fontSize: fontSize['2xs'], color: colors.primary, fontWeight: fontWeight.semiBold },
  weekRange:     { fontSize: fontSize['2xs'], color: colors.textTertiary },
});

// ─────────────────────────────────────────────────────────────
//  SHARED FORM COMPONENTS
// ─────────────────────────────────────────────────────────────

export function FormField({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ gap: spacing[2] }, style]}>{children}</View>;
}

export function FormLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textPrimary }}>
      {label}{required && <Text style={{ color: colors.primary }}> *</Text>}
    </Text>
  );
}

export function SectionHeader({
  title, actionLabel, onAction, style,
}: { title: string; actionLabel?: string; onAction?: () => void; style?: ViewStyle }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, style]}>
      <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary }}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.phasePregnancy }}>{actionLabel}</Text>
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
        <TouchableOpacity onPress={onAction} style={{ backgroundColor: colors.phasePregnancy, borderRadius: radius.full, paddingVertical: spacing[3], paddingHorizontal: spacing[7], marginTop: spacing[2], ...shadows.sm }}>
          <Text style={{ color: colors.textInverse, fontWeight: fontWeight.semiBold, fontSize: fontSize.base }}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
