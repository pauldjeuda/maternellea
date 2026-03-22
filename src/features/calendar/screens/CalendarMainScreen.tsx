/**
 * features/calendar/screens/CalendarMainScreen.tsx
 *
 * Unified calendar — aggregates all event sources.
 *
 * Layout:
 *   ┌──────────────────────────────────┐
 *   │  Header + MonthNavBar            │
 *   │  FilterBar (sticky)              │
 *   ├──────────────────────────────────┤
 *   │  [Month] 7-col grid              │
 *   │    ↕ toggle                       │
 *   │  [List]  upcoming events         │
 *   ├──────────────────────────────────┤
 *   │  DaySheet (slides up on tap)     │
 *   └──────────────────────────────────┘
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Animated, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { tokens } from '@theme/tokens';
import { todayISO, fmt } from '@utils/date';
import { useCalendarData } from '../hooks/useCalendarData';
import {
  MonthNavBar, MonthGrid, FilterBar,
  DaySheet, EventCard, CalendarLegend,
} from '../components/CalendarUI';
import { monthLabel, prevMonth, nextMonth } from '../utils/calendarGrid';
import type { CalendarFilter, CalendarEvent, CalendarViewMode } from '../types';
import type { CalendarNavProp } from '@types/navigation';

const { colors, spacing, radius, fontSize, fontWeight, shadows } = tokens;

// ─────────────────────────────────────────────────────────────
//  SCREEN
// ─────────────────────────────────────────────────────────────

export function CalendarMainScreen() {
  const navigation = useNavigation<CalendarNavProp>();
  const insets     = useSafeAreaInsets();
  const today      = todayISO();

  // Calendar data
  const {
    getEventsForDay, getDaySummaryForDate, getMonthData, getUpcoming,
  } = useCalendarData();

  // State
  const now          = new Date();
  const [year, setYear]             = useState(now.getFullYear());
  const [month, setMonth]           = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(today);
  const [filter, setFilter]         = useState<CalendarFilter>('all');
  const [viewMode, setViewMode]     = useState<CalendarViewMode>('month');
  const [showLegend, setShowLegend] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Month data
  const { grid, summaries, daysWithEvents } = useMemo(
    () => getMonthData(year, month, filter),
    [year, month, filter],
  );

  // Selected day events
  const selectedSummary = useMemo(
    () => selectedDay ? getDaySummaryForDate(selectedDay, filter) : undefined,
    [selectedDay, filter],
  );

  // Upcoming events for list view
  const upcoming = useMemo(
    () => getUpcoming(filter, today),
    [filter, today],
  );

  // Filter counts (for badge)
  const filterCounts = useMemo((): Partial<Record<CalendarFilter, number>> => {
    const all = getEventsForDay(today, 'all');
    return {
      appointment: all.filter(e => e.type === 'appointment').length,
      exam:        all.filter(e => e.type === 'exam').length,
      vaccine:     all.filter(e => e.type === 'vaccine').length,
    };
  }, [today]);

  // Navigation
  function goToPrev() {
    const { year: y, month: m } = prevMonth(year, month);
    setYear(y); setMonth(m);
  }
  function goToNext() {
    const { year: y, month: m } = nextMonth(year, month);
    setYear(y); setMonth(m);
  }
  function goToToday() {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDay(today);
  }

  // Event press → navigate to correct detail screen
  function handleEventPress(event: CalendarEvent) {
    navigation.navigate('EventDetail', {
      entityId:   event.entityId,
      entityType: event.entityType === 'prediction' ? 'period' : event.entityType as any,
    });
  }

  async function onRefresh() {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 700));
    setRefreshing(false);
  }

  const headerMonthLabel = monthLabel(year, month);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* ── TOP HEADER ─────────────────────────────────── */}
      <View style={s.header}>
        <Text style={s.title}>Calendrier</Text>
        <View style={s.headerActions}>
          <TouchableOpacity onPress={() => setShowLegend(v => !v)} style={s.iconBtn} hitSlop={8}>
            <Text style={{ fontSize: 18 }}>ℹ️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode(m => m === 'month' ? 'list' : 'month')}
            style={[s.iconBtn, { backgroundColor: colors.primaryLight }]}
          >
            <Text style={{ fontSize: 16, color: colors.primary, fontWeight: fontWeight.semiBold }}>
              {viewMode === 'month' ? '☰' : '▦'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── LEGEND (collapsible) ───────────────────────── */}
      {showLegend && (
        <View style={s.legend}>
          <CalendarLegend />
        </View>
      )}

      {/* ── FILTER BAR ─────────────────────────────────── */}
      <FilterBar active={filter} onChange={setFilter} counts={filterCounts} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 100 }]}
        stickyHeaderIndices={viewMode === 'month' ? [0] : []}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >

        {/* ── MONTH NAV (sticky in month mode) ─────────── */}
        <View style={s.navWrap}>
          <MonthNavBar
            label={headerMonthLabel}
            onPrev={goToPrev}
            onNext={goToNext}
            onToday={goToToday}
          />
        </View>

        {/* ── MONTH GRID ────────────────────────────────── */}
        {viewMode === 'month' && (
          <View style={s.gridWrap}>
            <MonthGrid
              grid={grid}
              summaries={summaries}
              selectedDay={selectedDay}
              onSelectDay={date => setSelectedDay(date === selectedDay ? null : date)}
            />
          </View>
        )}

        {/* ── DAY SHEET (inline in month mode) ─────────── */}
        {viewMode === 'month' && selectedDay && (
          <View style={s.daySheetWrap}>
            <DaySheet
              date={selectedDay}
              summary={selectedSummary}
              onEventPress={handleEventPress}
              onClose={() => setSelectedDay(null)}
            />
          </View>
        )}

        {/* ── LIST VIEW ─────────────────────────────────── */}
        {viewMode === 'list' && (
          <View style={s.listWrap}>
            {upcoming.length === 0 ? (
              <View style={s.emptyList}>
                <Text style={{ fontSize: 40 }}>📭</Text>
                <Text style={s.emptyTitle}>Aucun événement à venir</Text>
                <Text style={s.emptySub}>
                  {filter !== 'all' ? 'Essayez de modifier le filtre.' : 'Vos événements apparaîtront ici.'}
                </Text>
              </View>
            ) : (
              upcoming.map(({ date, events }) => (
                <View key={date} style={s.listGroup}>
                  <Text style={s.listDateLabel}>
                    {format(new Date(date + 'T12:00:00'), 'EEEE d MMMM', { locale: fr })}
                  </Text>
                  {events.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onPress={() => handleEventPress(event)}
                    />
                  ))}
                </View>
              ))
            )}
          </View>
        )}

        {/* ── DAYSWITHEVENT DOTS (month footer) ─────────── */}
        {viewMode === 'month' && daysWithEvents.length > 0 && !selectedDay && (
          <View style={s.dotsFooter}>
            <Text style={s.dotsFooterLabel}>
              {daysWithEvents.length} jour{daysWithEvents.length > 1 ? 's' : ''} avec des événements ce mois-ci
            </Text>
          </View>
        )}

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
  title:         { fontSize: fontSize['2xl'], fontWeight: fontWeight.extraBold, color: colors.textPrimary, letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: spacing[2] },
  iconBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  legend:        { paddingHorizontal: spacing[5], paddingBottom: spacing[3] },

  scroll:    { gap: 0 },
  navWrap:   { paddingHorizontal: spacing[5], paddingVertical: spacing[3], backgroundColor: colors.background },
  gridWrap:  { backgroundColor: colors.background, paddingBottom: spacing[3] },
  daySheetWrap: { marginHorizontal: spacing[5], marginBottom: spacing[4], borderRadius: radius['2xl'], overflow: 'hidden', ...shadows.md },

  listWrap:      { paddingHorizontal: spacing[5], paddingTop: spacing[2], gap: spacing[5] },
  listGroup:     { gap: spacing[3] },
  listDateLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textTertiary, textTransform: 'capitalize', paddingLeft: spacing[1] },

  emptyList: { alignItems: 'center', paddingVertical: spacing[16], gap: spacing[3] },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, textAlign: 'center' },
  emptySub:  { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', maxWidth: 260 },

  dotsFooter: { paddingHorizontal: spacing[5], paddingVertical: spacing[3], alignItems: 'center' },
  dotsFooterLabel: { fontSize: fontSize.xs, color: colors.textTertiary },
});
