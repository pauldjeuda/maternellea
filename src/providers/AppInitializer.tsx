/**
 * providers/AppInitializer.tsx
 *
 * Boot sequence (runs once, before any screen renders):
 *
 *   1. Schema migration guard
 *   2. Demo seed (first launch only)
 *   3. Notification channel setup (Android)
 *   4. Permission request (if authenticated)
 *   5. Re-schedule notifications lost after device reboot
 *   6. Full reminder sync
 *   7. Prune old records
 *
 * All steps are non-fatal — app continues on any error.
 */

import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { NotificationService }   from '@services/notifications/NotificationService';
import { ReminderOrchestrator }  from '@services/notifications/ReminderOrchestrator';
import { DemoSeedService }       from '@services/persistence/DemoSeedService';
import { PersistenceService }    from '@services/persistence/PersistenceService';
import { SCHEMA_VERSION }        from '@services/persistence/storageKeys';
import { useAuthStore }          from '@store/authStore';

interface AppInitializerProps { children: React.ReactNode; }

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const appState        = useRef<AppStateStatus>(AppState.currentState);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const booted          = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    async function boot() {
      const t0 = Date.now();
      console.log('[AppInit] Starting boot sequence…');

      // ── 1. Schema migration ──────────────────────────────
      if (!PersistenceService.isSchemaUpToDate()) {
        console.log('[AppInit] Schema migration needed');
        // Future: run migrations here
        PersistenceService.setSchemaVersion(SCHEMA_VERSION);
      }

      // ── 2. Demo seed (first launch only) ─────────────────
      if (DemoSeedService.shouldSeed()) {
        await DemoSeedService.seedAll();
      }

      // ── 3. Notification channels ─────────────────────────
      await NotificationService.setup();

      // ── 4–7. Auth-gated steps ────────────────────────────
      if (isAuthenticated) {
        const granted = await NotificationService.requestPermission();
        if (granted) {
          await NotificationService.rescheduleAfterReboot();
          await ReminderOrchestrator.syncAll();
          NotificationService.prune();
        }
      }

      console.log(`[AppInit] Boot complete in ${Date.now() - t0}ms`);
    }

    boot().catch(err => console.warn('[AppInit] boot error:', err));
  }, []);

  // Re-sync when app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState) => {
      const wasBackground = appState.current.match(/inactive|background/);
      appState.current = nextState;

      if (wasBackground && nextState === 'active' && isAuthenticated) {
        await NotificationService.requestPermission().catch(() => {});
        await ReminderOrchestrator.syncAll().catch(() => {});
      }
    });
    return () => sub.remove();
  }, [isAuthenticated]);

  return <>{children}</>;
};
