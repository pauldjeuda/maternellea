/**
 * services/storage/StorageService.ts
 *
 * Abstraction over MMKV (sync, fast) with AsyncStorage fallback.
 * All persistence goes through this service — never import
 * AsyncStorage or MMKV directly in feature code.
 *
 * MMKV is ~30× faster than AsyncStorage and supports synchronous reads,
 * which eliminates loading flickers for persisted store rehydration.
 */

import { MMKV } from 'react-native-mmkv';

// One global MMKV instance for the app.
// For sensitive data (tokens), use a second encrypted instance:
//   const secureStorage = new MMKV({ id: 'secure', encryptionKey: 'key' });
const storage = new MMKV({ id: 'maternellea' });

export const StorageService = {
  // ── String ──────────────────────────────────
  getString(key: string): string | undefined {
    return storage.getString(key);
  },

  setString(key: string, value: string): void {
    storage.set(key, value);
  },

  // ── JSON (typed) ─────────────────────────────
  getJSON<T>(key: string): T | null {
    const raw = storage.getString(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setJSON<T>(key: string, value: T): void {
    storage.set(key, JSON.stringify(value));
  },

  // ── Boolean ──────────────────────────────────
  getBoolean(key: string): boolean {
    return storage.getBoolean(key) ?? false;
  },

  setBoolean(key: string, value: boolean): void {
    storage.set(key, value);
  },

  // ── Number ───────────────────────────────────
  getNumber(key: string): number | undefined {
    return storage.getNumber(key);
  },

  setNumber(key: string, value: number): void {
    storage.set(key, value);
  },

  // ── Utility ──────────────────────────────────
  delete(key: string): void {
    storage.delete(key);
  },

  clearAll(): void {
    storage.clearAll();
  },

  contains(key: string): boolean {
    return storage.contains(key);
  },

  getAllKeys(): string[] {
    return storage.getAllKeys();
  },
} as const;

// ─────────────────────────────────────────────────────────────
// Zustand persist storage adapter
// Pass this as `storage` to `persist()` middleware.
// ─────────────────────────────────────────────────────────────

export const zustandMMKVStorage = {
  getItem: (key: string): string | null => {
    return StorageService.getString(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    StorageService.setString(key, value);
  },
  removeItem: (key: string): void => {
    StorageService.delete(key);
  },
};
