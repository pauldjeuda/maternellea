/**
 * services/notifications/schedulers/CycleScheduler.ts
 *
 * Builds ScheduleRequest[] from cycle prediction data.
 *
 * Scheduled reminders:
 *   1. Period reminder — N days before predicted start
 *   2. Fertile window opening — day of fertileWindowStart
 *   3. Ovulation day
 *
 * All IDs are stable: same prediction → same IDs → system deduplicates.
 */

import { addDays, parseISO, format } from 'date-fns';
import type { CyclePrediction } from '@types/models';
import type { ScheduleRequest } from '../types';

const DEFAULT_PERIOD_DAYS_BEFORE = 2;
const NOTIF_HOUR = 9; // 09:00 local time

function atNine(isoDate: string): string {
  const d = parseISO(isoDate);
  d.setHours(NOTIF_HOUR, 0, 0, 0);
  return d.toISOString();
}

export const CycleScheduler = {

  build(prediction: CyclePrediction, daysBefore = DEFAULT_PERIOD_DAYS_BEFORE): ScheduleRequest[] {
    const requests: ScheduleRequest[] = [];

    // 1. Period reminder
    const periodReminderDate = format(
      addDays(parseISO(prediction.nextPeriodStart), -daysBefore),
      'yyyy-MM-dd',
    );
    requests.push({
      id:      `cycle-period-${prediction.nextPeriodStart}`,
      type:    'period_prediction',
      title:   '🩸 Règles dans 2 jours',
      body:    `Vos prochaines règles sont estimées le ${format(parseISO(prediction.nextPeriodStart), 'd MMM')}. Pensez à vous préparer.`,
      fireAt:  atNine(periodReminderDate),
      payload: { predictedStart: prediction.nextPeriodStart },
    });

    // 2. Fertile window start
    requests.push({
      id:      `cycle-fertile-${prediction.fertileWindowStart}`,
      type:    'period_prediction',
      title:   '🌿 Fenêtre fertile ouverte',
      body:    `Votre fenêtre fertile démarre aujourd'hui. Elle durera jusqu'au ${format(parseISO(prediction.fertileWindowEnd), 'd MMM')}.`,
      fireAt:  atNine(prediction.fertileWindowStart),
      payload: { fertileEnd: prediction.fertileWindowEnd },
    });

    // 3. Ovulation day
    requests.push({
      id:      `cycle-ovulation-${prediction.ovulationDate}`,
      type:    'period_prediction',
      title:   '🌟 Jour d\'ovulation estimé',
      body:    'Aujourd\'hui est votre jour d\'ovulation estimé. Probabilité de conception maximale.',
      fireAt:  atNine(prediction.ovulationDate),
      payload: { ovulationDate: prediction.ovulationDate },
    });

    return requests;
  },
} as const;
