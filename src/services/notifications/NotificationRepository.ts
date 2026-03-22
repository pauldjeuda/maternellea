/**
 * services/notifications/NotificationRepository.ts
 *
 * Persistence layer for scheduled notifications.
 * Stores ReminderRecord[] in MMKV so the app knows what's scheduled
 * even after a restart (system may have dropped notifications on
 * device reboot — this allows re-scheduling).
 *
 * This is NOT the Zustand store layer. It's a plain service that
 * NotificationService calls. Feature stores don't import this.
 */

import { PersistenceService } from '@services/persistence/PersistenceService';
import { SK } from '@services/persistence/storageKeys';
import type { ReminderRecord } from './types';

// ─────────────────────────────────────────────────────────────
//  REPOSITORY
// ─────────────────────────────────────────────────────────────

export const NotificationRepository = {

  /** Load all stored ReminderRecords */
  getAll(): ReminderRecord[] {
    return PersistenceService.getJSON<ReminderRecord[]>(SK.NOTIF_SCHEDULED) ?? [];
  },

  /** Persist the full list (replace) */
  saveAll(records: ReminderRecord[]): void {
    PersistenceService.setJSON(SK.NOTIF_SCHEDULED, records);
  },

  /** Get a single record by ID */
  getById(id: string): ReminderRecord | undefined {
    return this.getAll().find(r => r.id === id);
  },

  /** Add or replace a record */
  upsert(record: ReminderRecord): void {
    const all = this.getAll();
    const idx = all.findIndex(r => r.id === record.id);
    if (idx !== -1) {
      all[idx] = record;
    } else {
      all.push(record);
    }
    this.saveAll(all);
  },

  /** Mark a record as fired */
  markFired(id: string): void {
    const all = this.getAll();
    const idx = all.findIndex(r => r.id === id);
    if (idx !== -1) {
      all[idx]!.status  = 'fired';
      all[idx]!.firedAt = new Date().toISOString();
      this.saveAll(all);
    }
  },

  /** Mark a record as cancelled */
  markCancelled(id: string): void {
    const all = this.getAll();
    const idx = all.findIndex(r => r.id === id);
    if (idx !== -1) {
      all[idx]!.status = 'cancelled';
      this.saveAll(all);
    }
  },

  /** Remove a record entirely */
  remove(id: string): void {
    this.saveAll(this.getAll().filter(r => r.id !== id));
  },

  /** Return only pending records */
  getPending(): ReminderRecord[] {
    return this.getAll().filter(r => r.status === 'pending');
  },

  /** Clear fired/cancelled records older than N days */
  prune(olderThanDays = 30): number {
    const cutoff = Date.now() - olderThanDays * 86_400_000;
    const all    = this.getAll();
    const kept   = all.filter(r => {
      if (r.status === 'pending') return true;
      const ts = new Date(r.firedAt ?? r.createdAt).getTime();
      return ts > cutoff;
    });
    this.saveAll(kept);
    return all.length - kept.length;
  },

  /** Store the last time the scheduler ran */
  setLastRun(iso: string): void {
    PersistenceService.setString(SK.NOTIF_LAST_RUN, iso);
  },
  getLastRun(): string | undefined {
    return PersistenceService.getString(SK.NOTIF_LAST_RUN);
  },

  /** Store permission status */
  setPermissionStatus(status: 'granted' | 'denied' | 'unknown'): void {
    PersistenceService.setString(SK.NOTIF_PERMISSION, status);
  },
  getPermissionStatus(): 'granted' | 'denied' | 'unknown' {
    return (PersistenceService.getString(SK.NOTIF_PERMISSION) as any) ?? 'unknown';
  },

  /** Wipe everything (logout / reset) */
  clearAll(): void {
    PersistenceService.delete(SK.NOTIF_SCHEDULED);
    PersistenceService.delete(SK.NOTIF_LAST_RUN);
  },
} as const;
