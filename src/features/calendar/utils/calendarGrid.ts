/**
 * features/calendar/utils/calendarGrid.ts
 * Pure functions to build the month grid and day summaries.
 */

import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, format, isToday, parseISO, isSameMonth,
} from 'date-fns';
import type { CalendarEvent, DaySummary } from '../types';

// ─── ISO date from Date ───────────────────────────────────────

export function toISO(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

// ─── Month grid (Mon-start, null = padding cell) ─────────────

export function buildMonthGrid(year: number, month: number): (string | null)[] {
  const first   = startOfMonth(new Date(year, month));
  const last    = endOfMonth(first);
  const days    = eachDayOfInterval({ start: first, end: last }).map(toISO);
  const padding = (getDay(first) + 6) % 7;  // 0=Mon offset
  return [...Array(padding).fill(null), ...days];
}

// ─── Day summary ─────────────────────────────────────────────

export function buildDaySummary(
  date:    string,
  events:  CalendarEvent[],
): DaySummary {
  if (events.length === 0) {
    return {
      date,
      events:     [],
      dots:       [],
      isToday:    isToday(parseISO(date)),
      hasPrimary: false,
    };
  }

  // Primary fill color: lowest sortOrder primary event
  const primary = events.find(e => e.isPrimary);
  const cellColor = primary?.bgColor;

  // Up to 3 distinct dot colors (avoid repeats)
  const seen = new Set<string>();
  const dots: string[] = [];
  for (const ev of events) {
    if (!seen.has(ev.color)) {
      seen.add(ev.color);
      dots.push(ev.color);
      if (dots.length === 3) break;
    }
  }

  return {
    date,
    events,
    cellColor,
    dots,
    isToday:    isToday(parseISO(date)),
    hasPrimary: !!primary,
  };
}

// ─── Navigation helpers ───────────────────────────────────────

export function prevMonth(year: number, month: number): { year: number; month: number } {
  return month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
}

export function nextMonth(year: number, month: number): { year: number; month: number } {
  return month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
}

export function monthLabel(year: number, month: number): string {
  return format(new Date(year, month), 'MMMM yyyy', {
    locale: require('date-fns/locale/fr').fr,
  });
}

// ─── Get first day of current visible month that has events ───

export function getDaysWithEvents(
  dayMap: Map<string, CalendarEvent[]>,
  year: number,
  month: number,
): string[] {
  const first = startOfMonth(new Date(year, month));
  const last  = endOfMonth(first);
  return Array.from(dayMap.keys()).filter(date => {
    const d = parseISO(date);
    return d >= first && d <= last;
  }).sort();
}

// ─── List view: upcoming events (sorted) ─────────────────────

export function getUpcomingEvents(
  dayMap: Map<string, CalendarEvent[]>,
  from:   string,
  limit = 30,
): { date: string; events: CalendarEvent[] }[] {
  const today   = new Date();
  const results: { date: string; events: CalendarEvent[] }[] = [];

  for (const [date, events] of [...dayMap.entries()].sort()) {
    if (date < from) continue;
    const relevant = events.filter(e =>
      e.type !== 'period' &&
      e.type !== 'fertile' &&
      e.isPrimary,
    );
    if (relevant.length > 0) {
      results.push({ date, events: relevant });
    }
    if (results.length >= limit) break;
  }

  return results;
}
