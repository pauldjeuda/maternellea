/**
 * features/vaccines/services/scheduleRegistry.ts
 *
 * Registry of all available national vaccine schedules.
 *
 * To add a new country:
 *   1. Create features/vaccines/services/schedules/<code>.ts
 *   2. Import and register it here
 *   3. The UI automatically shows country selection
 */

import type { VaccineScheduleProvider } from '../types';
import { FR_SCHEDULE } from './schedules/fr';

// ─── Registry ────────────────────────────────────────────────

const REGISTRY: Map<string, VaccineScheduleProvider> = new Map([
  ['FR', FR_SCHEDULE],
  // Future:
  // ['CM', CM_SCHEDULE],
  // ['BE', BE_SCHEDULE],
  // ['CH', CH_SCHEDULE],
  // ['SN', SN_SCHEDULE],
]);

// ─── Public API ──────────────────────────────────────────────

/** Get the schedule for a country code, falling back to FR */
export function getSchedule(countryCode: string): VaccineScheduleProvider {
  return REGISTRY.get(countryCode) ?? REGISTRY.get('FR')!;
}

/** List all available country codes */
export function getAvailableCountries(): { code: string; name: string }[] {
  return Array.from(REGISTRY.values()).map(p => ({
    code: p.countryCode,
    name: p.countryName,
  }));
}

/** Check if a country has a dedicated schedule */
export function hasScheduleFor(countryCode: string): boolean {
  return REGISTRY.has(countryCode);
}

export { FR_SCHEDULE };
