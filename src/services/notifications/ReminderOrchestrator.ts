/**
 * services/notifications/ReminderOrchestrator.ts
 *
 * Top-level coordinator.
 * Called by AppInitializer after boot and after any data change
 * that may affect scheduled reminders.
 *
 * Flow:
 *   1. Cancel all pending notifications
 *   2. For each active domain, build ScheduleRequest[]
 *   3. Schedule all requests via NotificationService
 *   4. Persist results via NotificationRepository
 *
 * Features call syncReminders() after creating / updating records.
 * It is safe to call multiple times (idempotent via stable IDs).
 */

import { NotificationService }    from './NotificationService';
import { CycleScheduler }          from './schedulers/CycleScheduler';
import {
  AppointmentScheduler, VaccineScheduler, PregnancyScheduler,
} from './schedulers/DomainSchedulers';
import type { ScheduleRequest }    from './types';

// ─────────────────────────────────────────────────────────────
//  OPTIONS
// ─────────────────────────────────────────────────────────────

interface OrchestratorOptions {
  /** Minutes before appointments to remind (default: from appointment.reminderMinutes) */
  appointmentDefaultMinutes?: number;
  /** Days before cycle to remind (default: 2) */
  cycleDaysBefore?: number;
}

// ─────────────────────────────────────────────────────────────
//  ORCHESTRATOR
// ─────────────────────────────────────────────────────────────

export const ReminderOrchestrator = {

  /**
   * Full sync: rebuild all reminders from current store state.
   * Call this on app boot and after significant data changes.
   */
  async syncAll(opts: OrchestratorOptions = {}): Promise<void> {
    if (!NotificationService.isPermissionGranted()) {
      console.log('[Orchestrator] Permission not granted — skipping sync');
      return;
    }

    console.log('[Orchestrator] Starting full reminder sync…');
    const t0       = Date.now();
    const requests: ScheduleRequest[] = [];

    // ── Collect from stores (lazy require avoids circular deps) ──
    try {
      // Cycle
      const { useCycleStore } = require('@store/cycleStore');
      const cycleState        = useCycleStore.getState();
      if (cycleState.prediction) {
        requests.push(
          ...CycleScheduler.build(cycleState.prediction, opts.cycleDaysBefore),
        );
      }

      // Pregnancy appointments
      const { usePregnancyStore } = require('@store/pregnancyStore');
      const pregState             = usePregnancyStore.getState();
      requests.push(...AppointmentScheduler.buildAll(pregState.appointments));

      // Weekly pregnancy digest
      if (pregState.pregnancy) {
        const { useAuthStore }    = require('@store/authStore');
        const { weeklyDigestEnabled } = useAuthStore.getState().user ?? {};
        if (weeklyDigestEnabled) {
          requests.push(...PregnancyScheduler.buildWeeklyDigest(pregState.pregnancy));
        }
      }

      // Vaccines
      const { useVaccineStore } = require('@store/vaccineStore');
      const vaccState           = useVaccineStore.getState();
      requests.push(...VaccineScheduler.buildAll(vaccState.records));

    } catch (err) {
      console.warn('[Orchestrator] Error building requests:', err);
    }

    // ── Cancel existing, then schedule new ──────────────────
    await NotificationService.cancelAll();
    const scheduled = await NotificationService.scheduleMany(requests);

    console.log(
      `[Orchestrator] Sync done in ${Date.now() - t0}ms — ` +
      `${requests.length} built, ${scheduled} scheduled`,
    );
  },

  /**
   * Partial sync for a specific domain.
   * More efficient than a full sync when only one entity changed.
   */
  async syncCycle(): Promise<void> {
    if (!NotificationService.isPermissionGranted()) return;
    const { useCycleStore } = require('@store/cycleStore');
    const { prediction }    = useCycleStore.getState();
    if (!prediction) return;

    // Cancel old cycle notifications
    const pending = NotificationService.getPendingRecords();
    for (const r of pending.filter(r => r.type === 'period_prediction')) {
      await NotificationService.cancel(r.id);
    }
    await NotificationService.scheduleMany(CycleScheduler.build(prediction));
  },

  async syncAppointment(appointmentId: string): Promise<void> {
    if (!NotificationService.isPermissionGranted()) return;
    const { usePregnancyStore } = require('@store/pregnancyStore');
    const apt = usePregnancyStore.getState().appointments.find(
      (a: any) => a.id === appointmentId,
    );
    if (!apt) return;

    // Cancel existing reminders for this appointment
    const ids = [`apt-daybefore-${appointmentId}`, `apt-prenotif-${appointmentId}`];
    for (const id of ids) await NotificationService.cancel(id);

    await NotificationService.scheduleMany(AppointmentScheduler.build(apt));
  },

  async syncVaccines(): Promise<void> {
    if (!NotificationService.isPermissionGranted()) return;
    const { useVaccineStore } = require('@store/vaccineStore');
    const { records }         = useVaccineStore.getState();

    // Cancel old vaccine notifications
    const pending = NotificationService.getPendingRecords();
    for (const r of pending.filter(r => r.type === 'vaccine')) {
      await NotificationService.cancel(r.id);
    }
    await NotificationService.scheduleMany(VaccineScheduler.buildAll(records));
  },
} as const;
