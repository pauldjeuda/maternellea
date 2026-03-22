/**
 * services/notifications/NotificationService.ts
 *
 * Public API for all notification operations in the app.
 *
 * Architecture:
 *   Feature code
 *       ↓ calls
 *   NotificationService.schedule() / cancel() / …
 *       ↓ delegates to
 *   INotificationProvider (currently NotifeeProvider)
 *       ↓ persists state to
 *   NotificationRepository (MMKV)
 *
 * Design principles:
 *   - Features never import the provider directly
 *   - All methods are safe (catch + warn, never crash the caller)
 *   - Past-date scheduling is silently skipped
 *   - Repository tracks state for restart re-scheduling
 */

import { NotifeeProvider }          from './NotifeeProvider';
import { NotificationRepository }   from './NotificationRepository';
import type { INotificationProvider, ScheduleRequest, ReminderRecord } from './types';

// ─── Active provider — swap here to change backend ───────────
const provider: INotificationProvider = NotifeeProvider;

export const NotificationService = {

  // ── Boot ────────────────────────────────────────────────────

  async setup(): Promise<void> {
    try { await provider.setup(); }
    catch (err) { console.warn('[NS] setup:', err); }
  },

  async requestPermission(): Promise<boolean> {
    try {
      const granted = await provider.requestPermission();
      NotificationRepository.setPermissionStatus(granted ? 'granted' : 'denied');
      return granted;
    } catch (err) {
      console.warn('[NS] requestPermission:', err);
      return false;
    }
  },

  isPermissionGranted(): boolean {
    return NotificationRepository.getPermissionStatus() === 'granted';
  },

  // ── Scheduling ──────────────────────────────────────────────

  async schedule(req: ScheduleRequest): Promise<boolean> {
    const fireDate = new Date(req.fireAt);
    if (fireDate.getTime() <= Date.now()) {
      console.log(`[NS] Skipping past notification: ${req.id}`);
      return false;
    }

    const record: ReminderRecord = {
      id: req.id, type: req.type, title: req.title, body: req.body,
      fireAt: req.fireAt, recurring: req.recurring ?? false,
      intervalDays: req.intervalDays, payload: req.payload,
      createdAt: new Date().toISOString(), status: 'pending',
    };

    try {
      const systemId  = await provider.schedule(req);
      record.systemId = systemId;
      NotificationRepository.upsert(record);
      return true;
    } catch (err) {
      console.warn(`[NS] schedule error ${req.id}:`, err);
      NotificationRepository.upsert(record); // persist for retry
      return false;
    }
  },

  async scheduleMany(requests: ScheduleRequest[]): Promise<number> {
    let count = 0;
    for (const req of requests) { if (await this.schedule(req)) count++; }
    return count;
  },

  // ── Cancellation ────────────────────────────────────────────

  async cancel(id: string): Promise<void> {
    try {
      const rec = NotificationRepository.getById(id);
      if (rec?.systemId) await provider.cancel(rec.systemId);
      NotificationRepository.markCancelled(id);
    } catch (err) { console.warn(`[NS] cancel ${id}:`, err); }
  },

  async cancelAll(): Promise<void> {
    try {
      await provider.cancelAll();
      for (const r of NotificationRepository.getPending()) {
        NotificationRepository.markCancelled(r.id);
      }
    } catch (err) { console.warn('[NS] cancelAll:', err); }
  },

  // ── Immediate ───────────────────────────────────────────────

  async displayNow(
    type: ScheduleRequest['type'], title: string, body: string,
  ): Promise<void> {
    try { await provider.displayNow({ type, title, body }); }
    catch (err) { console.warn('[NS] displayNow:', err); }
  },

  // ── Inspection ──────────────────────────────────────────────

  async getPendingIds(): Promise<string[]> {
    try { return await provider.getPendingIds(); }
    catch { return []; }
  },

  getPendingRecords(): ReminderRecord[] {
    return NotificationRepository.getPending();
  },

  // ── Re-scheduling after device reboot ───────────────────────

  async rescheduleAfterReboot(): Promise<void> {
    const systemIds   = new Set(await this.getPendingIds());
    const pending     = NotificationRepository.getPending();
    let count = 0;

    for (const record of pending) {
      if (!record.systemId || !systemIds.has(record.systemId)) {
        const ok = await this.schedule({
          id: record.id, type: record.type, title: record.title,
          body: record.body, fireAt: record.fireAt,
          recurring: record.recurring, intervalDays: record.intervalDays,
          payload: record.payload,
        });
        if (ok) count++;
      }
    }

    if (count > 0) console.log(`[NS] Re-scheduled ${count} after reboot`);
    NotificationRepository.setLastRun(new Date().toISOString());
  },

  prune(): void {
    const n = NotificationRepository.prune(30);
    if (n > 0) console.log(`[NS] Pruned ${n} old records`);
  },
} as const;
