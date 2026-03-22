/**
 * utils/date.ts
 *
 * All date helpers for the home dashboard and feature screens.
 * Wraps date-fns with French locale and app-specific logic.
 */

import {
  format, formatDistance, parseISO, isToday, isTomorrow,
  differenceInDays, differenceInCalendarMonths, differenceInWeeks,
  addDays, addMonths, isBefore, isAfter, isSameDay,
  startOfDay, endOfDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Formatting ──────────────────────────────────────────────

export function fmt(date: string | Date, pattern = 'dd MMMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: fr });
}

export function fmtShort(date: string | Date): string {
  return fmt(date, 'd MMM');
}

export function fmtLong(date: string | Date): string {
  return fmt(date, 'EEEE d MMMM');
}

export function fmtDateTime(date: string | Date): string {
  return fmt(date, "d MMM 'à' HH:mm");
}

export function fmtTime(date: string | Date): string {
  return fmt(date, 'HH:mm');
}

export function fromNow(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(d, new Date(), { locale: fr, addSuffix: true });
}

// ─── Day labels ──────────────────────────────────────────────

export function dayLabel(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d))    return "aujourd'hui";
  if (isTomorrow(d)) return 'demain';
  const diff = differenceInDays(d, new Date());
  if (diff > 0 && diff <= 7) return `dans ${diff} jour${diff > 1 ? 's' : ''}`;
  return fmtShort(d);
}

export function daysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return Math.max(0, differenceInDays(startOfDay(d), startOfDay(new Date())));
}

export function daysSince(date: string | Date): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return Math.max(0, differenceInDays(startOfDay(new Date()), startOfDay(d)));
}

// ─── Baby age ────────────────────────────────────────────────

export interface BabyAge {
  totalDays:   number;
  totalMonths: number;
  label:       string;
  shortLabel:  string;
}

export function getBabyAge(birthDate: string): BabyAge {
  const birth      = parseISO(birthDate);
  const today      = new Date();
  const totalDays  = differenceInDays(today, birth);
  const totalMonths = differenceInCalendarMonths(today, birth);

  let label: string;
  let shortLabel: string;

  if (totalDays === 0) {
    label = "né(e) aujourd'hui";
    shortLabel = '0 j';
  } else if (totalDays < 7) {
    label = `${totalDays} jour${totalDays > 1 ? 's' : ''}`;
    shortLabel = `${totalDays}j`;
  } else if (totalDays < 30) {
    const weeks = Math.floor(totalDays / 7);
    const days  = totalDays % 7;
    label = days > 0
      ? `${weeks} sem. et ${days} j`
      : `${weeks} semaine${weeks > 1 ? 's' : ''}`;
    shortLabel = `${weeks} sem.`;
  } else if (totalMonths < 12) {
    const remDays = differenceInDays(today, addMonths(birth, totalMonths));
    label = remDays > 0
      ? `${totalMonths} mois et ${remDays} j`
      : `${totalMonths} mois`;
    shortLabel = `${totalMonths} mois`;
  } else {
    const years     = Math.floor(totalMonths / 12);
    const remMonths = totalMonths % 12;
    label = remMonths > 0
      ? `${years} an${years > 1 ? 's' : ''} et ${remMonths} mois`
      : `${years} an${years > 1 ? 's' : ''}`;
    shortLabel = `${years} an${years > 1 ? 's' : ''}`;
  }

  return { totalDays, totalMonths, label, shortLabel };
}

// ─── Pregnancy ───────────────────────────────────────────────

export function pregnancyProgressPct(currentWeek: number): number {
  return Math.min(100, Math.round((currentWeek / 40) * 100));
}

export function weeksAndDaysLabel(week: number, day: number): string {
  if (day === 0) return `${week} SA`;
  return `${week} SA + ${day}j`;
}

// ─── Date in range ───────────────────────────────────────────

export function isDateInRange(
  date: string | Date,
  start: string | Date,
  end: string | Date,
): boolean {
  const d = typeof date  === 'string' ? parseISO(date)  : date;
  const s = typeof start === 'string' ? parseISO(start) : start;
  const e = typeof end   === 'string' ? parseISO(end)   : end;
  return (isAfter(d, s) || isSameDay(d, s)) && (isBefore(d, e) || isSameDay(d, e));
}

// ─── Today ISO ───────────────────────────────────────────────

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function nowISO(): string {
  return new Date().toISOString();
}
