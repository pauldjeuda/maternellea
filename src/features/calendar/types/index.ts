/**
 * features/calendar/types/index.ts
 *
 * Unified CalendarEvent model — the single shape that every data
 * source (cycle, pregnancy, vaccines, …) maps TO before display.
 *
 * Data-flow:
 *   Domain model (Appointment, CycleEntry, VaccineRecord, …)
 *       ↓  mapper (calendarMappers.ts)
 *   CalendarEvent[]
 *       ↓  hook   (useCalendarData.ts)
 *   DayEvents map  { [ISODate]: CalendarEvent[] }
 *       ↓  component
 *   CalendarMonth + EventList
 */

// ─────────────────────────────────────────────────────────────
//  EVENT TYPES
// ─────────────────────────────────────────────────────────────

export type CalendarEventType =
  | 'period'           // confirmed bleeding day
  | 'period_predicted' // estimated future period
  | 'ovulation'        // estimated ovulation day
  | 'fertile'          // fertile window day (not ovulation)
  | 'appointment'      // prenatal or postnatal appointment
  | 'exam'             // medical exam / lab test
  | 'vaccine'          // vaccine record or upcoming
  | 'reminder'         // custom reminder
  | 'journal'          // pregnancy journal entry (dot only)
  | 'note';            // cycle or postpartum daily note (dot only)

// ─────────────────────────────────────────────────────────────
//  UNIFIED EVENT  (what screens consume)
// ─────────────────────────────────────────────────────────────

export interface CalendarEvent {
  /** Unique ID within the calendar (prefixed: "apt-001", "cy-001-d1", …) */
  id:          string;
  /** ISO date: "YYYY-MM-DD" — the primary day this event falls on */
  date:        string;
  /** Optional end date for multi-day events (period, fertile window) */
  endDate?:    string;
  type:        CalendarEventType;
  title:       string;
  subtitle?:   string;
  /** Display color for dot / pill / stripe */
  color:       string;
  /** Background tint for cell highlight */
  bgColor:     string;
  /** Emoji or icon key */
  emoji:       string;
  /** Whether the event should show a full card vs just a dot */
  isPrimary:   boolean;
  /** Original entity type, for navigation */
  entityType:  'appointment' | 'period' | 'vaccine' | 'exam' | 'prediction' | 'note' | 'journal';
  /** ID of the originating record, for navigation */
  entityId:    string;
  /** Optional time string "HH:mm" */
  time?:       string;
  /** Completed / done state */
  isDone?:     boolean;
  /** Sort order within a day (lower = first) */
  sortOrder:   number;
}

// ─────────────────────────────────────────────────────────────
//  FILTER
// ─────────────────────────────────────────────────────────────

export type CalendarFilter =
  | 'all'
  | 'period'
  | 'fertility'
  | 'appointment'
  | 'exam'
  | 'vaccine';

export interface FilterConfig {
  key:     CalendarFilter;
  label:   string;
  emoji:   string;
  color:   string;
  types:   CalendarEventType[];
}

export const FILTER_CONFIGS: FilterConfig[] = [
  { key: 'all',         label: 'Tout',        emoji: '🗓️', color: '#374151',  types: [] },
  { key: 'period',      label: 'Cycle',        emoji: '🩸', color: '#F53D6B',  types: ['period','period_predicted','ovulation','fertile'] },
  { key: 'fertility',   label: 'Fertilité',    emoji: '🌿', color: '#3DA468',  types: ['ovulation','fertile','period_predicted'] },
  { key: 'appointment', label: 'Rendez-vous',  emoji: '📋', color: '#A367A1',  types: ['appointment'] },
  { key: 'exam',        label: 'Examens',      emoji: '🔬', color: '#0284C7',  types: ['exam'] },
  { key: 'vaccine',     label: 'Vaccins',      emoji: '💉', color: '#22C55E',  types: ['vaccine'] },
];

// ─────────────────────────────────────────────────────────────
//  DAY SUMMARY  (per-cell in the calendar grid)
// ─────────────────────────────────────────────────────────────

export interface DaySummary {
  date:       string;
  events:     CalendarEvent[];
  /** Primary fill color for the cell (period > appointment > exam > …) */
  cellColor?: string;
  /** Dot indicators (up to 3, distinct types) */
  dots:       string[];   // color strings
  isToday:    boolean;
  hasPrimary: boolean;    // has at least one isPrimary event
}

// ─────────────────────────────────────────────────────────────
//  VIEW MODE
// ─────────────────────────────────────────────────────────────

export type CalendarViewMode = 'month' | 'list';

// ─────────────────────────────────────────────────────────────
//  WEEK DAYS CONFIG (Mon-start)
// ─────────────────────────────────────────────────────────────

export const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;
