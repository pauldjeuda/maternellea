/**
 * features/calendar/components/CalendarUI.tsx
 *
 * All calendar-specific UI primitives.
 *
 * Exports:
 *   MonthGrid        — 7-column month grid (30/31 cells + padding)
 *   CalendarCell     — single day cell
 *   FilterBar        — horizontal scrollable filter chips
 *   EventChip        — compact event pill (used inside DaySheet)
 *   EventCard        — full event card for list view
 *   DaySheet         — bottom panel showing events for a selected day
 *   CalendarLegend   — color key
 *   MonthNavBar      — prev/next + month label
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ViewStyle, Dimensions,
} from 'react-native';
import { format, parseISO, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

import { tokens } from '@theme/tokens';
import { fmtShort, fmtDateTime, fmt } from '@utils/date';
import { WEEK_DAYS, FILTER_CONFIGS } from '../types';
import type { DaySummary, CalendarEvent, CalendarFilter, FilterConfig } from '../types';

const { colors, spacing, radius, fontSize, fontWeight, shadows, palette } = tokens;
const SCREEN_W = Dimensions.get('window').width;
const CELL_SIZE = Math.floor((SCREEN_W - spacing[5] * 2 - spacing[2] * 6) / 7);

// ─────────────────────────────────────────────────────────────
//  MONTH NAV BAR
// ─────────────────────────────────────────────────────────────

interface MonthNavBarProps {
  label:    string;
  onPrev:   () => void;
  onNext:   () => void;
  onToday?: () => void;
  style?:   ViewStyle;
}

export function MonthNavBar({ label, onPrev, onNext, onToday, style }: MonthNavBarProps) {
  return (
    <View style={[navS.wrap, style]}>
      <TouchableOpacity onPress={onPrev} style={navS.btn} hitSlop={8}>
        <Text style={navS.arrow}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onToday} style={navS.labelWrap} disabled={!onToday}>
        <Text style={navS.label}>{label}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onNext} style={navS.btn} hitSlop={8}>
        <Text style={navS.arrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const navS = StyleSheet.create({
  wrap:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[2] },
  btn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  arrow:     { fontSize: 22, color: colors.textSecondary, fontWeight: fontWeight.bold, lineHeight: 26 },
  labelWrap: { flex: 1, alignItems: 'center', paddingHorizontal: spacing[2] },
  label:     { fontSize: fontSize.xl, fontWeight: fontWeight.extraBold, color: colors.textPrimary, textTransform: 'capitalize', letterSpacing: -0.5 },
});

// ─────────────────────────────────────────────────────────────
//  CALENDAR CELL
// ─────────────────────────────────────────────────────────────

interface CalendarCellProps {
  date:     string | null;
  summary?: DaySummary;
  selected: boolean;
  onPress:  (date: string) => void;
}

export function CalendarCell({ date, summary, selected, onPress }: CalendarCellProps) {
  if (!date) return <View style={{ width: CELL_SIZE, height: CELL_SIZE + 14 }} />;

  const dayNum = parseInt(date.split('-')[2]!, 10);
  const today  = summary?.isToday ?? false;
  const hasPri = summary?.hasPrimary ?? false;
  const cell   = summary?.cellColor;
  const dots   = summary?.dots ?? [];

  // Visual priority: selected > cellColor fill > today ring > plain
  const bg =
    selected ? colors.primary :
    cell     ? cell           : 'transparent';

  const textColor =
    selected ? colors.textInverse :
    today    ? colors.primary     : colors.textPrimary;

  return (
    <TouchableOpacity
      onPress={() => onPress(date)}
      activeOpacity={0.72}
      style={[
        cellS.wrap,
        { width: CELL_SIZE, height: CELL_SIZE + 14 },
      ]}
    >
      <View style={[
        cellS.circle,
        { backgroundColor: bg, width: CELL_SIZE - 2, height: CELL_SIZE - 2 },
        today && !selected && !cell && { borderWidth: 1.5, borderColor: colors.primary },
        selected && shadows.coloredSm,
      ]}>
        <Text style={[
          cellS.dayNum,
          { color: textColor },
          today && !selected && { fontWeight: fontWeight.extraBold },
        ]}>
          {dayNum}
        </Text>
      </View>

      {/* Dot indicators (max 3) */}
      {dots.length > 0 && !selected && (
        <View style={cellS.dots}>
          {dots.map((color, i) => (
            <View key={i} style={[cellS.dot, { backgroundColor: color }]} />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const cellS = StyleSheet.create({
  wrap:    { alignItems: 'center', justifyContent: 'flex-start' },
  circle:  { borderRadius: CELL_SIZE / 2, alignItems: 'center', justifyContent: 'center' },
  dayNum:  { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  dots:    { flexDirection: 'row', gap: 2, marginTop: 2, height: 5, alignItems: 'center' },
  dot:     { width: 4, height: 4, borderRadius: 2 },
});

// ─────────────────────────────────────────────────────────────
//  MONTH GRID
// ─────────────────────────────────────────────────────────────

interface MonthGridProps {
  grid:        (string | null)[];
  summaries:   Map<string, DaySummary>;
  selectedDay: string | null;
  onSelectDay: (date: string) => void;
  style?:      ViewStyle;
}

export function MonthGrid({ grid, summaries, selectedDay, onSelectDay, style }: MonthGridProps) {
  return (
    <View style={[{ paddingHorizontal: spacing[5] }, style]}>
      {/* Day headers */}
      <View style={gridS.weekHeader}>
        {WEEK_DAYS.map(d => (
          <View key={d} style={{ width: CELL_SIZE, alignItems: 'center' }}>
            <Text style={gridS.weekDay}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid rows */}
      <View style={gridS.grid}>
        {grid.map((date, idx) => (
          <CalendarCell
            key={date ?? `pad-${idx}`}
            date={date}
            summary={date ? summaries.get(date) : undefined}
            selected={date === selectedDay}
            onPress={onSelectDay}
          />
        ))}
      </View>
    </View>
  );
}

const gridS = StyleSheet.create({
  weekHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingBottom: spacing[2], borderBottomWidth: 1, borderBottomColor: colors.borderLight,
    marginBottom: spacing[1],
  },
  weekDay: { fontSize: fontSize.xs, color: colors.textTertiary, fontWeight: fontWeight.semiBold, textTransform: 'uppercase' },
  grid:    { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing[1] / 2 },
});

// ─────────────────────────────────────────────────────────────
//  FILTER BAR
// ─────────────────────────────────────────────────────────────

interface FilterBarProps {
  active:   CalendarFilter;
  onChange: (f: CalendarFilter) => void;
  counts:   Partial<Record<CalendarFilter, number>>;
  style?:   ViewStyle;
}

export function FilterBar({ active, onChange, counts, style }: FilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[{ borderBottomWidth: 1, borderBottomColor: colors.border }, style]}
      contentContainerStyle={fbS.row}
    >
      {FILTER_CONFIGS.map(cfg => {
        const isActive = active === cfg.key;
        const count    = counts[cfg.key];
        return (
          <TouchableOpacity
            key={cfg.key}
            onPress={() => onChange(cfg.key)}
            style={[fbS.chip, isActive && { backgroundColor: cfg.color + '1A', borderColor: cfg.color }]}
          >
            <Text style={fbS.emoji}>{cfg.emoji}</Text>
            <Text style={[fbS.label, isActive && { color: cfg.color, fontWeight: fontWeight.semiBold }]}>
              {cfg.label}
            </Text>
            {count !== undefined && count > 0 && (
              <View style={[fbS.badge, { backgroundColor: isActive ? cfg.color : colors.border }]}>
                <Text style={[fbS.badgeText, { color: isActive ? colors.textInverse : colors.textTertiary }]}>
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const fbS = StyleSheet.create({
  row:       { paddingHorizontal: spacing[5], paddingVertical: spacing[3], gap: spacing[2] },
  chip:      { flexDirection: 'row', alignItems: 'center', gap: spacing[1.5], paddingVertical: spacing[1.5], paddingHorizontal: spacing[3], borderRadius: radius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.border },
  emoji:     { fontSize: 14 },
  label:     { fontSize: fontSize.sm, color: colors.textSecondary },
  badge:     { borderRadius: radius.full, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { fontSize: fontSize['2xs'], fontWeight: fontWeight.bold },
});

// ─────────────────────────────────────────────────────────────
//  EVENT CHIP  (compact, used inside DaySheet)
// ─────────────────────────────────────────────────────────────

export function EventChip({ event, onPress }: { event: CalendarEvent; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.78}
      style={[ecS.chip, { backgroundColor: event.bgColor, borderColor: event.color + '55' }]}
    >
      <Text style={{ fontSize: 14 }}>{event.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[ecS.title, { color: event.color }]} numberOfLines={1}>{event.title}</Text>
        {event.subtitle && <Text style={ecS.sub} numberOfLines={1}>{event.subtitle}</Text>}
      </View>
      {event.time && <Text style={ecS.time}>{event.time}</Text>}
      {event.isDone && <Text style={{ fontSize: 13 }}>✓</Text>}
    </TouchableOpacity>
  );
}

const ecS = StyleSheet.create({
  chip:  { flexDirection: 'row', alignItems: 'center', gap: spacing[2], borderRadius: radius.lg, padding: spacing[3], borderWidth: 1 },
  title: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold },
  sub:   { fontSize: fontSize.xs, color: colors.textTertiary },
  time:  { fontSize: fontSize.xs, color: colors.textTertiary, fontWeight: fontWeight.medium },
});

// ─────────────────────────────────────────────────────────────
//  EVENT CARD  (list view — full)
// ─────────────────────────────────────────────────────────────

interface EventCardProps {
  event:   CalendarEvent;
  onPress?: () => void;
  showDate?: boolean;
}

export function EventCard({ event, onPress, showDate }: EventCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.86}
      style={[evcS.card, event.isDone && evcS.done]}
    >
      <View style={[evcS.stripe, { backgroundColor: event.isDone ? colors.success : event.color }]} />
      <View style={[evcS.iconWrap, { backgroundColor: event.bgColor }]}>
        <Text style={{ fontSize: 20 }}>{event.emoji}</Text>
      </View>
      <View style={evcS.body}>
        {showDate && (
          <Text style={evcS.dateLabel}>
            {fmt(event.date, 'EEEE d MMMM')}
            {event.time ? ` · ${event.time}` : ''}
          </Text>
        )}
        <Text style={[evcS.title, event.isDone && { color: colors.textSecondary }]}>
          {event.title}
        </Text>
        {event.subtitle && (
          <Text style={evcS.sub} numberOfLines={2}>{event.subtitle}</Text>
        )}
      </View>
      {event.isDone && (
        <View style={evcS.doneBadge}>
          <Text style={evcS.doneText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const evcS = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...shadows.xs, borderWidth: 1, borderColor: colors.borderLight },
  done:      { opacity: 0.75 },
  stripe:    { width: 4, alignSelf: 'stretch' },
  iconWrap:  { width: 40, height: 40, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: spacing[1] },
  body:      { flex: 1, paddingVertical: spacing[3], paddingRight: spacing[4], gap: spacing[0.5] },
  dateLabel: { fontSize: fontSize.xs, color: colors.textTertiary, fontWeight: fontWeight.medium, textTransform: 'capitalize', marginBottom: 2 },
  title:     { fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.textPrimary },
  sub:       { fontSize: fontSize.sm, color: colors.textSecondary },
  doneBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.successLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  doneText:  { fontSize: 14, color: colors.successText, fontWeight: fontWeight.bold },
});

// ─────────────────────────────────────────────────────────────
//  DAY SHEET  (shows events for the selected day, slides up)
// ─────────────────────────────────────────────────────────────

interface DaySheetProps {
  date:     string | null;
  summary?: DaySummary;
  onEventPress: (event: CalendarEvent) => void;
  onClose:  () => void;
}

export function DaySheet({ date, summary, onEventPress, onClose }: DaySheetProps) {
  if (!date) return null;

  const events      = summary?.events ?? [];
  const dayNum      = parseInt(date.split('-')[2]!, 10);
  const isToday_    = summary?.isToday;
  const dayLongFmt  = format(parseISO(date), 'EEEE d MMMM', { locale: fr });

  // Group: primary events vs dots-only
  const primary    = events.filter(e => e.isPrimary);
  const secondary  = events.filter(e => !e.isPrimary);

  return (
    <View style={dsS.container}>
      {/* Header */}
      <View style={dsS.header}>
        <View>
          <Text style={[dsS.dayNum, isToday_ && { color: colors.primary }]}>{dayNum}</Text>
          <Text style={dsS.dayLabel}>{dayLongFmt}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={dsS.closeBtn} hitSlop={8}>
          <Text style={dsS.closeX}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Events */}
      {events.length === 0 ? (
        <View style={dsS.empty}>
          <Text style={dsS.emptyText}>Aucun événement ce jour</Text>
        </View>
      ) : (
        <ScrollView style={dsS.scroll} showsVerticalScrollIndicator={false}>
          {primary.map(ev => (
            <EventChip key={ev.id} event={ev} onPress={() => onEventPress(ev)} />
          ))}
          {secondary.map(ev => (
            <EventChip key={ev.id} event={ev} onPress={() => onEventPress(ev)} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const dsS = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius:  radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingTop:           spacing[4],
    paddingHorizontal:    spacing[5],
    paddingBottom:        spacing[6],
    minHeight:            180,
    maxHeight:            320,
    ...shadows.lg,
  },
  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[4] },
  dayNum:   { fontSize: fontSize['3xl'], fontWeight: fontWeight.extraBold, color: colors.textPrimary, lineHeight: fontSize['3xl'] * 1.1 },
  dayLabel: { fontSize: fontSize.sm, color: colors.textTertiary, textTransform: 'capitalize' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  closeX:   { fontSize: 20, color: colors.textSecondary, lineHeight: 24 },
  scroll:   { gap: spacing[2] },
  empty:    { alignItems: 'center', paddingVertical: spacing[6] },
  emptyText: { fontSize: fontSize.base, color: colors.textTertiary },
});

// ─────────────────────────────────────────────────────────────
//  CALENDAR LEGEND
// ─────────────────────────────────────────────────────────────

export function CalendarLegend({ style }: { style?: ViewStyle }) {
  const items = [
    { color: colors.phaseCycle,     label: 'Règles'        },
    { color: palette.rose100,       label: 'Règles prévues' },
    { color: colors.fertile,        label: 'Ovulation'     },
    { color: colors.fertileLight,   label: 'Fenêtre fertile'},
    { color: colors.phasePregnancy, label: 'Rendez-vous'   },
    { color: colors.info,           label: 'Examens'       },
    { color: colors.success,        label: 'Vaccins'       },
  ];

  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] }, style]}>
      {items.map(item => (
        <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1.5] }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
