/**
 * services/notifications/schedulers/AppointmentScheduler.ts
 * services/notifications/schedulers/VaccineScheduler.ts
 * services/notifications/schedulers/PregnancyScheduler.ts
 *
 * All domain schedulers in one file. Each exports a single object
 * with a build() method that returns ScheduleRequest[].
 */

import { parseISO, addMinutes, addDays, format } from 'date-fns';
import type { Appointment, VaccineRecord, PregnancyProfile } from '@types/models';
import type { ScheduleRequest } from '../types';

const NOTIF_HOUR = 9;

function atNine(isoDate: string): string {
  const d = parseISO(isoDate);
  d.setHours(NOTIF_HOUR, 0, 0, 0);
  return d.toISOString();
}

// ─────────────────────────────────────────────────────────────
//  APPOINTMENT SCHEDULER
// ─────────────────────────────────────────────────────────────

export const AppointmentScheduler = {

  /**
   * Build reminder(s) for a single appointment.
   * Creates up to 2 notifications: one the day before, one N minutes before.
   */
  build(apt: Appointment): ScheduleRequest[] {
    if (apt.isCompleted) return [];

    const requests: ScheduleRequest[] = [];
    const aptDate = new Date(apt.date);

    // 1. Day-before reminder (at 09:00)
    const dayBefore = addDays(aptDate, -1);
    dayBefore.setHours(NOTIF_HOUR, 0, 0, 0);
    if (dayBefore.getTime() > Date.now()) {
      requests.push({
        id:      `apt-daybefore-${apt.id}`,
        type:    'appointment',
        title:   `📋 Rappel RDV demain`,
        body:    `"${apt.title}" demain à ${format(aptDate, 'HH:mm')}${apt.location ? ` — ${apt.location}` : ''}.`,
        fireAt:  dayBefore.toISOString(),
        payload: { appointmentId: apt.id },
      });
    }

    // 2. Pre-appointment reminder (N minutes before, default 60)
    const minutesBefore = apt.reminderMinutes ?? 60;
    if (apt.reminderEnabled && minutesBefore > 0) {
      const preReminder = addMinutes(aptDate, -minutesBefore);
      if (preReminder.getTime() > Date.now()) {
        const label = minutesBefore >= 60
          ? `${minutesBefore / 60}h`
          : `${minutesBefore} min`;
        requests.push({
          id:      `apt-prenotif-${apt.id}`,
          type:    'appointment',
          title:   `📋 ${apt.title} dans ${label}`,
          body:    apt.doctorName
            ? `RDV avec ${apt.doctorName}${apt.location ? ` · ${apt.location}` : ''}`
            : apt.location ?? '',
          fireAt:  preReminder.toISOString(),
          payload: { appointmentId: apt.id },
        });
      }
    }

    return requests;
  },

  /** Build for a list of appointments */
  buildAll(appointments: Appointment[]): ScheduleRequest[] {
    return appointments.flatMap(apt => this.build(apt));
  },
} as const;

// ─────────────────────────────────────────────────────────────
//  VACCINE SCHEDULER
// ─────────────────────────────────────────────────────────────

const VACCINE_DAYS_BEFORE = [14, 3]; // 2 weeks + 3 days before

export const VaccineScheduler = {

  build(record: VaccineRecord): ScheduleRequest[] {
    if (record.status === 'done' || record.status === 'skipped') return [];
    if (!record.scheduledDate) return [];

    return VACCINE_DAYS_BEFORE.flatMap(daysBefore => {
      const fireDate = addDays(parseISO(record.scheduledDate!), -daysBefore);
      fireDate.setHours(NOTIF_HOUR, 0, 0, 0);

      if (fireDate.getTime() <= Date.now()) return [];

      const label = daysBefore === 1 ? 'demain' : `dans ${daysBefore} jours`;
      return [{
        id:      `vaccine-${record.id}-${daysBefore}d`,
        type:    'vaccine' as const,
        title:   `💉 Vaccin ${record.vaccine.shortName} ${label}`,
        body:    `${record.vaccine.name} prévu le ${format(parseISO(record.scheduledDate!), 'd MMM')}. ${record.vaccine.isMandatory ? 'Vaccin obligatoire.' : ''}`,
        fireAt:  fireDate.toISOString(),
        payload: { vaccineRecordId: record.id, vaccineId: record.vaccineId },
      } as ScheduleRequest];
    });
  },

  buildAll(records: VaccineRecord[]): ScheduleRequest[] {
    return records.flatMap(r => this.build(r));
  },
} as const;

// ─────────────────────────────────────────────────────────────
//  WEEKLY PREGNANCY SCHEDULER
// ─────────────────────────────────────────────────────────────

/** Weekly pregnancy digest — fires every Monday at 08:00 */
export const PregnancyScheduler = {

  buildWeeklyDigest(pregnancy: PregnancyProfile): ScheduleRequest[] {
    const now     = new Date();
    const dueDate = parseISO(pregnancy.dueDate);

    // Next Monday at 08:00
    const daysToMonday = (1 - now.getDay() + 7) % 7 || 7;
    const fireDate     = addDays(now, daysToMonday);
    fireDate.setHours(8, 0, 0, 0);

    // Don't schedule if past due date
    if (fireDate > dueDate || fireDate.getTime() <= Date.now()) return [];

    return [{
      id:           `preg-weekly-${format(fireDate, 'yyyy-Www')}`,
      type:         'weekly_pregnancy',
      title:        `🤰 Semaine ${pregnancy.currentWeek + 1} de grossesse`,
      body:         'Découvrez les changements de cette semaine pour vous et votre bébé.',
      fireAt:       fireDate.toISOString(),
      recurring:    true,
      intervalDays: 7,
      payload:      { week: String(pregnancy.currentWeek + 1) },
    }];
  },
} as const;
