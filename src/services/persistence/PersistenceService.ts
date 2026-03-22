/**
 * services/persistence/PersistenceService.ts
 *
 * Central persistence layer for the entire app.
 *
 * Architecture:
 *   ┌─────────────────────────────────────────┐
 *   │           Feature code / Hooks          │
 *   └────────────┬────────────────────────────┘
 *                │ imports
 *   ┌────────────▼────────────────────────────┐
 *   │         PersistenceService              │  ← this file
 *   │  typed reads/writes · batch ops         │
 *   │  migration guard · schema versioning    │
 *   └────────────┬───────────────┬────────────┘
 *                │               │
 *   ┌────────────▼──────┐ ┌─────▼────────────┐
 *   │   MMKV (main)     │ │  MMKV (secure)   │
 *   │  StorageService   │ │  tokens / keys   │
 *   └───────────────────┘ └──────────────────┘
 *
 * Zustand persist middleware uses zustandMMKVStorage (re-exported here).
 * Direct writes (session meta, notification state) use PersistenceService.
 */

import { MMKV } from 'react-native-mmkv';
import { SK, SCHEMA_VERSION } from './storageKeys';

// ─────────────────────────────────────────────────────────────
//  MMKV INSTANCES
// ─────────────────────────────────────────────────────────────

/** Primary store — app data, store snapshots */
const mainDB = new MMKV({ id: 'maternellea' });

/**
 * Secure store — tokens, encryption keys.
 * In production, add an encryptionKey derived from device Keychain:
 *   const encryptionKey = await Keychain.getGenericPassword();
 *   new MMKV({ id: 'maternellea-secure', encryptionKey: encryptionKey.password })
 */
const secureDB = new MMKV({ id: 'maternellea-secure' });

// ─────────────────────────────────────────────────────────────
//  LOW-LEVEL HELPERS
// ─────────────────────────────────────────────────────────────

function safeParseJSON<T>(raw: string | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
//  PUBLIC API
// ─────────────────────────────────────────────────────────────

export const PersistenceService = {

  // ── String ──────────────────────────────────────────────────

  getString(key: string): string | undefined {
    return mainDB.getString(key);
  },
  setString(key: string, value: string): void {
    mainDB.set(key, value);
  },

  // ── JSON (fully typed) ────────────────────────────────────

  getJSON<T>(key: string): T | null {
    return safeParseJSON<T>(mainDB.getString(key));
  },
  setJSON<T>(key: string, value: T): void {
    mainDB.set(key, JSON.stringify(value));
  },

  // ── Boolean ───────────────────────────────────────────────

  getBoolean(key: string): boolean {
    return mainDB.getBoolean(key) ?? false;
  },
  setBoolean(key: string, value: boolean): void {
    mainDB.set(key, value);
  },

  // ── Number ────────────────────────────────────────────────

  getNumber(key: string): number | undefined {
    return mainDB.getNumber(key);
  },
  setNumber(key: string, value: number): void {
    mainDB.set(key, value);
  },

  // ── Secure (tokens, encryption keys) ──────────────────────

  getSecure(key: string): string | undefined {
    return secureDB.getString(key);
  },
  setSecure(key: string, value: string): void {
    secureDB.set(key, value);
  },
  deleteSecure(key: string): void {
    secureDB.delete(key);
  },

  // ── Batch ─────────────────────────────────────────────────

  /**
   * Atomic batch write — all-or-nothing semantics at the app level
   * (MMKV itself writes are synchronous, no actual transaction needed).
   */
  batchSet(entries: { key: string; value: string }[]): void {
    for (const { key, value } of entries) {
      mainDB.set(key, value);
    }
  },

  // ── Lifecycle ─────────────────────────────────────────────

  delete(key: string): void {
    mainDB.delete(key);
  },
  contains(key: string): boolean {
    return mainDB.contains(key);
  },
  getAllKeys(): string[] {
    return mainDB.getAllKeys();
  },

  /** Wipe all user data (main + secure). Called on logout. */
  clearUserData(): void {
    // Keep meta keys across logout (first-launch flag, schema version)
    const metaKeys = [SK.META_FIRST_LAUNCH, SK.META_SCHEMA_VERSION];
    const preserved: { key: string; value: string }[] = [];
    for (const key of metaKeys) {
      const v = mainDB.getString(key);
      if (v !== undefined) preserved.push({ key, value: v });
    }
    mainDB.clearAll();
    secureDB.clearAll();
    for (const { key, value } of preserved) {
      mainDB.set(key, value);
    }
  },

  // ── Schema / Migration ────────────────────────────────────

  getSchemaVersion(): number {
    return mainDB.getNumber(SK.META_SCHEMA_VERSION) ?? 0;
  },
  setSchemaVersion(v: number): void {
    mainDB.set(SK.META_SCHEMA_VERSION, v);
  },
  isSchemaUpToDate(): boolean {
    return this.getSchemaVersion() === SCHEMA_VERSION;
  },

  // ── First launch ─────────────────────────────────────────

  isFirstLaunch(): boolean {
    return !mainDB.contains(SK.META_FIRST_LAUNCH);
  },
  markFirstLaunchDone(): void {
    mainDB.set(SK.META_FIRST_LAUNCH, new Date().toISOString());
  },
  getFirstLaunchDate(): string | undefined {
    return mainDB.getString(SK.META_FIRST_LAUNCH);
  },
} as const;

// ─────────────────────────────────────────────────────────────
//  ZUSTAND ADAPTER  (re-exported so stores don't need two imports)
// ─────────────────────────────────────────────────────────────

export const zustandMMKVStorage = {
  getItem:    (key: string): string | null     => mainDB.getString(key) ?? null,
  setItem:    (key: string, value: string): void => mainDB.set(key, value),
  removeItem: (key: string): void               => mainDB.delete(key),
};

// ─────────────────────────────────────────────────────────────
//  LEGACY ALIAS  (keeps backward compat with existing store imports)
// ─────────────────────────────────────────────────────────────

export const StorageService = PersistenceService;
