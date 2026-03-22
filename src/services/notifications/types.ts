/**
 * services/notifications/types.ts
 *
 * All notification-related types.
 *
 * Architecture principle:
 *   NotificationProvider (interface) — what we program against
 *       ↑ implements
 *   NotifeeProvider       — react-native-notifee (current)
 *   ExpoProvider          — Expo Notifications (future)
 *   FirebaseProvider      — FCM push (future)
 *
 * ScheduleRequest   — what features pass in
 * ReminderRecord    — what we persist to MMKV
 * ScheduledResult   — what the provider returns
 */

import type { ReminderType } from '@types/models';

// ─────────────────────────────────────────────────────────────
//  SCHEDULE REQUEST
//  What feature code submits to NotificationService.schedule()
// ─────────────────────────────────────────────────────────────

export interface ScheduleRequest {
  /** Unique stable ID within the app (e.g. "cycle-period-2026-04-12") */
  id:          string;
  type:        ReminderType;
  title:       string;
  body:        string;
  /** ISO datetime when the notification should fire */
  fireAt:      string;
  /** If true, re-schedule automatically after firing */
  recurring?:  boolean;
  /** Days between recurrences (only when recurring = true) */
  intervalDays?: number;
  /** Data payload forwarded to onPress handler */
  payload?:    Record<string, string>;
}

// ─────────────────────────────────────────────────────────────
//  REMINDER RECORD  (persisted in MMKV)
// ─────────────────────────────────────────────────────────────

export interface ReminderRecord {
  id:           string;
  type:         ReminderType;
  title:        string;
  body:         string;
  fireAt:       string;   // ISO datetime
  recurring:    boolean;
  intervalDays?: number;
  payload?:     Record<string, string>;
  /** Notifee / system notification ID returned after scheduling */
  systemId?:    string;
  createdAt:    string;
  /** Set after the notification fires */
  firedAt?:     string;
  /** 'pending' | 'fired' | 'cancelled' */
  status:       'pending' | 'fired' | 'cancelled';
}

// ─────────────────────────────────────────────────────────────
//  PROVIDER INTERFACE
//  Any notification backend must implement this.
// ─────────────────────────────────────────────────────────────

export interface INotificationProvider {
  /** One-time setup: channels (Android), categories (iOS) */
  setup(): Promise<void>;
  /** Request OS permission. Returns true if granted. */
  requestPermission(): Promise<boolean>;
  /** Schedule a local notification. Returns system ID. */
  schedule(req: ScheduleRequest): Promise<string>;
  /** Cancel a notification by its system ID */
  cancel(systemId: string): Promise<void>;
  /** Cancel all pending notifications */
  cancelAll(): Promise<void>;
  /** Display immediately (no scheduling) */
  displayNow(req: Pick<ScheduleRequest, 'type' | 'title' | 'body'>): Promise<void>;
  /** Return IDs of all pending scheduled notifications */
  getPendingIds(): Promise<string[]>;
}

// ─────────────────────────────────────────────────────────────
//  CHANNEL CONFIG  (Android)
// ─────────────────────────────────────────────────────────────

export interface ChannelConfig {
  id:          string;
  name:        string;
  description: string;
  importance:  'high' | 'default' | 'low';
  sound:       boolean;
  vibration:   boolean;
}

export const APP_CHANNELS: ChannelConfig[] = [
  {
    id:          'channel_cycle',
    name:        'Cycle menstruel',
    description: 'Rappels de règles et fenêtre fertile',
    importance:  'high',
    sound:       true,
    vibration:   true,
  },
  {
    id:          'channel_appointment',
    name:        'Rendez-vous médicaux',
    description: 'Rappels avant vos consultations',
    importance:  'high',
    sound:       true,
    vibration:   true,
  },
  {
    id:          'channel_vaccine',
    name:        'Vaccins bébé',
    description: 'Alertes calendrier vaccinal',
    importance:  'high',
    sound:       true,
    vibration:   true,
  },
  {
    id:          'channel_general',
    name:        'Maternellea',
    description: 'Informations générales et digest',
    importance:  'default',
    sound:       true,
    vibration:   false,
  },
];

// ─────────────────────────────────────────────────────────────
//  CHANNEL ROUTER  (type → channel ID)
// ─────────────────────────────────────────────────────────────

export function channelIdForType(type: ReminderType): string {
  switch (type) {
    case 'period_prediction':  return 'channel_cycle';
    case 'appointment':        return 'channel_appointment';
    case 'vaccine':            return 'channel_vaccine';
    case 'weekly_pregnancy':
    case 'postpartum_checkup':
    case 'custom':
    default:                   return 'channel_general';
  }
}
