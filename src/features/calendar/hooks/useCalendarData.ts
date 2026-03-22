/**
 * features/calendar/hooks/useCalendarData.ts
 *
 * The single aggregation point for the calendar.
 * Reads all domain stores, maps to CalendarEvent[], builds the DayMap.
 *
 * Adding a new data source = add one mapper call here.
 * Screens never import individual stores.
 */

import { useMemo, useEffect } from 'react';

import { useAuthStore, selectUser, selectActivePhase } from '@store/authStore';
import { useCycleStore }     from '@store/cycleStore';
import { usePregnancyStore } from '@store/pregnancyStore';
import { useBabyStore }      from '@store/babyStore';
import { useVaccineStore }   from '@store/vaccineStore';

import {
  mapCycleEntries, mapCyclePrediction,
  mapAppointments, mapExams, mapVaccineRecords,
  buildDayMap,
} from '../utils/calendarMappers';
import {
  buildMonthGrid, buildDaySummary,
  getDaysWithEvents, getUpcomingEvents,
  prevMonth, nextMonth, monthLabel, toISO,
} from '../utils/calendarGrid';
import type { CalendarEvent, CalendarFilter, DaySummary } from '../types';
import { FILTER_CONFIGS } from '../types';

// ─────────────────────────────────────────────────────────────
//  HOOK
// ─────────────────────────────────────────────────────────────

export function useCalendarData() {
  const user         = useAuthStore(selectUser);
  const activePhase  = useAuthStore(selectActivePhase);

  // ── Raw store data ──────────────────────────────────────────
  const cycleEntries = useCycleStore(s => s.entries);
  const prediction   = useCycleStore(s => s.prediction);

  const appointments = usePregnancyStore(s => s.appointments);
  const exams        = usePregnancyStore(s => s.exams);

  const vaccineRecords = useVaccineStore(s => s.records);
  const activeBaby     = useBabyStore(selectActiveBaby => selectActiveBaby.babies.find(b => b.isActive) ?? selectActiveBaby.babies[0] ?? null);

  const pregActions  = usePregnancyStore(s => s.actions);
  const babyActions  = useBabyStore(s => s.actions);
  const vaccineAct   = useVaccineStore(s => s.actions);
  const cycleActions = useCycleStore(s => s.actions);

  // Seed stores if needed
  useEffect(() => {
    pregActions.seed();
    babyActions.seed();
    vaccineAct.seed();
    if (cycleEntries.length === 0) {
      const { MOCK_CYCLE_ENTRIES, MOCK_SYMPTOMS } = require('@services/mocks/dashboardData');
      cycleActions.seed(MOCK_CYCLE_ENTRIES, MOCK_SYMPTOMS);
    }
  }, []);

  // ── Map all sources → CalendarEvent[] ──────────────────────
  const allEvents = useMemo((): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // Cycle (always include — user may have cycle history even in pregnancy)
    events.push(...mapCycleEntries(cycleEntries));
    events.push(...mapCyclePrediction(prediction));

    // Pregnancy
    events.push(...mapAppointments(appointments));
    events.push(...mapExams(exams));

    // Vaccines
    events.push(...mapVaccineRecords(vaccineRecords));

    return events;
  }, [cycleEntries, prediction, appointments, exams, vaccineRecords]);

  // ── DayMap ─────────────────────────────────────────────────
  const dayMap = useMemo(() => buildDayMap(allEvents), [allEvents]);

  // ─────────────────────────────────────────────────────────────
  //  FILTERING
  // ─────────────────────────────────────────────────────────────

  function applyFilter(events: CalendarEvent[], filter: CalendarFilter): CalendarEvent[] {
    if (filter === 'all') return events;
    const cfg = FILTER_CONFIGS.find(f => f.key === filter);
    if (!cfg || cfg.types.length === 0) return events;
    return events.filter(e => cfg.types.includes(e.type));
  }

  function getFilteredDayMap(filter: CalendarFilter): Map<string, CalendarEvent[]> {
    if (filter === 'all') return dayMap;
    const filtered: CalendarEvent[] = [];
    for (const events of dayMap.values()) {
      filtered.push(...applyFilter(events, filter));
    }
    return buildDayMap(filtered);
  }

  // ─────────────────────────────────────────────────────────────
  //  PER-DAY ACCESS
  // ─────────────────────────────────────────────────────────────

  function getEventsForDay(date: string, filter: CalendarFilter = 'all'): CalendarEvent[] {
    const events = dayMap.get(date) ?? [];
    return applyFilter(events, filter);
  }

  function getDaySummaryForDate(date: string, filter: CalendarFilter = 'all'): DaySummary {
    return buildDaySummary(date, getEventsForDay(date, filter));
  }

  // ─────────────────────────────────────────────────────────────
  //  MONTH GRID
  // ─────────────────────────────────────────────────────────────

  function getMonthData(year: number, month: number, filter: CalendarFilter = 'all') {
    const grid = buildMonthGrid(year, month);
    const fMap = getFilteredDayMap(filter);

    const summaries = new Map<string, DaySummary>();
    for (const dateOrNull of grid) {
      if (!dateOrNull) continue;
      const events = fMap.get(dateOrNull) ?? [];
      summaries.set(dateOrNull, buildDaySummary(dateOrNull, events));
    }

    const daysWithEvents = getDaysWithEvents(fMap, year, month);

    return { grid, summaries, daysWithEvents };
  }

  // ─────────────────────────────────────────────────────────────
  //  UPCOMING LIST  (for list view)
  // ─────────────────────────────────────────────────────────────

  function getUpcoming(filter: CalendarFilter = 'all', from = toISO(new Date())) {
    const fMap = getFilteredDayMap(filter);
    return getUpcomingEvents(fMap, from);
  }

  return {
    // Data
    allEvents,
    dayMap,
    activePhase,
    user,
    activeBaby,
    // Accessors
    getEventsForDay,
    getDaySummaryForDate,
    getMonthData,
    getUpcoming,
    applyFilter,
    // Grid helpers (pass-through for screens)
    prevMonth,
    nextMonth,
    monthLabel,
  };
}

// Selector helper for useBabyStore
const selectActiveBabyFn = (s: ReturnType<typeof useBabyStore.getState>) =>
  s.babies.find(b => b.isActive) ?? s.babies[0] ?? null;
