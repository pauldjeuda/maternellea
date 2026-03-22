/**
 * services/persistence/storageKeys.ts
 *
 * Single source of truth for every MMKV key used in the app.
 *
 * Rules:
 *   - All keys are kebab-case strings prefixed with a namespace
 *   - Zustand persist stores use "store/<domain>"
 *   - Direct MMKV writes use "@mat/<key>"
 *   - Metadata uses "meta/<key>"
 *   - Never hard-code a key string outside this file
 *
 * To migrate a key in a future version:
 *   1. Add a new key (e.g. STORE_CYCLE_V2 = 'store/cycle-v2')
 *   2. Write a migration in persistence/migrations.ts
 *   3. Delete the old key after migration
 */

export const SK = {
  // ─── Auth ────────────────────────────────────────────────
  /** Zustand auth store (user profile + tokens + phase) */
  STORE_AUTH:          'store/auth',

  // ─── Feature stores (Zustand persist) ────────────────────
  STORE_CYCLE:         'store/cycle',
  STORE_CYCLE_NOTES:   'store/cycle-notes',
  STORE_PREGNANCY:     'store/pregnancy',
  STORE_BABY:          'store/baby',
  STORE_VACCINES:      'store/vaccines',
  STORE_ADVICE:        'store/advice',
  STORE_PREFERENCES:   'store/preferences',

  // ─── Metadata / app lifecycle ────────────────────────────
  /** ISO datetime of first app launch → triggers demo seeding */
  META_FIRST_LAUNCH:   'meta/first-launch',
  /** ISO datetime of last successful store hydration */
  META_LAST_HYDRATION: 'meta/last-hydration',
  /** Numeric schema version for migration guard */
  META_SCHEMA_VERSION: 'meta/schema-version',

  // ─── Notification scheduling ─────────────────────────────
  /** JSON array of active ReminderRecord */
  NOTIF_SCHEDULED:     '@mat/notif-scheduled',
  /** ISO datetime of last scheduler run */
  NOTIF_LAST_RUN:      '@mat/notif-last-run',
  /** User's notification permission status: 'granted'|'denied'|'unknown' */
  NOTIF_PERMISSION:    '@mat/notif-permission',

  // ─── Cache ────────────────────────────────────────────────
  /** ISO datetime of last API sync (for future online mode) */
  CACHE_LAST_SYNC:     '@mat/cache-last-sync',
} as const;

/** Current schema version — bump when store shapes change */
export const SCHEMA_VERSION = 1;

export type StorageKey = typeof SK[keyof typeof SK];
