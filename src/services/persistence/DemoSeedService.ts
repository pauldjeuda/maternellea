/**
 * services/persistence/DemoSeedService.ts
 *
 * Seeds all Zustand stores with realistic demo data on first launch.
 *
 * Strategy:
 *   - Called ONCE by AppInitializer when isFirstLaunch() === true
 *   - Each store's seed() action is called directly (no store import cycles)
 *   - All dates are computed relative to "today" — always fresh
 *   - The demo user is "Camille", SA 22 pregnancy profile
 *
 * To add a new domain:
 *   1. Add its seed data here
 *   2. Call its store.getState().actions.seed() in seedAll()
 *   3. No changes needed elsewhere
 */

import { PersistenceService } from './PersistenceService';
import { SK } from './storageKeys';

// ─────────────────────────────────────────────────────────────
//  DOMAIN STORE GETTERS  (imported lazily to avoid circular deps)
// ─────────────────────────────────────────────────────────────

function getStores() {
  // Lazy require avoids circular dependency at module load time
  const { useCycleStore }       = require('@store/cycleStore');
  const { usePregnancyStore }   = require('@store/pregnancyStore');
  const { useBabyStore }        = require('@store/babyStore');
  const { useVaccineStore }     = require('@store/vaccineStore');
  const { useAdviceStore }      = require('@features/advice/store/adviceStore');
  const { useCycleNoteStore }   = require('@features/cycle/store/cycleNoteStore');

  return {
    cycle:       useCycleStore.getState(),
    cycleNotes:  useCycleNoteStore.getState(),
    pregnancy:   usePregnancyStore.getState(),
    baby:        useBabyStore.getState(),
    vaccines:    useVaccineStore.getState(),
    advice:      useAdviceStore.getState(),
  };
}

// ─────────────────────────────────────────────────────────────
//  SEED ORCHESTRATOR
// ─────────────────────────────────────────────────────────────

export const DemoSeedService = {

  /**
   * Returns true if demo data should be seeded.
   * Condition: first launch AND no existing store data.
   */
  shouldSeed(): boolean {
    return PersistenceService.isFirstLaunch();
  },

  /**
   * Seeds all stores.
   * Idempotent: each store's seed() checks if data already exists.
   * Safe to call multiple times.
   */
  async seedAll(): Promise<void> {
    console.log('[DemoSeedService] Seeding demo data…');
    const t0 = Date.now();

    try {
      const stores = getStores();

      // 1. Cycle (entries + symptoms + notes)
      if (stores.cycle.entries.length === 0) {
        const { MOCK_CYCLE_ENTRIES, MOCK_SYMPTOMS } = require('@services/mocks/dashboardData');
        stores.cycle.actions.seed(MOCK_CYCLE_ENTRIES, MOCK_SYMPTOMS);
        console.log('[DemoSeedService] ✓ cycle');
      }

      // 2. Cycle notes
      stores.cycleNotes.actions.seed();
      console.log('[DemoSeedService] ✓ cycle-notes');

      // 3. Pregnancy (profile + appointments + exams + journal + weight + checklist)
      stores.pregnancy.actions.seed();
      console.log('[DemoSeedService] ✓ pregnancy');

      // 4. Baby (profile + growth + postpartum + health notes)
      stores.baby.actions.seed();
      console.log('[DemoSeedService] ✓ baby');

      // 5. Vaccines (records)
      stores.vaccines.actions.seed();
      console.log('[DemoSeedService] ✓ vaccines');

      // 6. Mark first launch done and store timestamp
      PersistenceService.markFirstLaunchDone();

      console.log(`[DemoSeedService] Done in ${Date.now() - t0}ms`);
    } catch (err) {
      console.error('[DemoSeedService] Seed failed:', err);
      // Non-fatal — app works without demo data
    }
  },

  /**
   * Reset all stores and re-seed (for "Réinitialiser la démo" in dev settings).
   */
  async resetAndReseed(): Promise<void> {
    console.log('[DemoSeedService] Resetting and reseeding…');

    // Clear store data but keep meta
    const storeKeys = [
      SK.STORE_CYCLE, SK.STORE_CYCLE_NOTES,
      SK.STORE_PREGNANCY, SK.STORE_BABY,
      SK.STORE_VACCINES, SK.STORE_ADVICE,
    ];
    for (const key of storeKeys) {
      PersistenceService.delete(key);
    }
    // Remove first-launch flag so seedAll() will run
    PersistenceService.delete(SK.META_FIRST_LAUNCH);

    await this.seedAll();
  },

  /**
   * Inspect what's currently seeded (for debugging).
   */
  getStatus(): Record<string, number> {
    const stores = getStores();
    return {
      cycleEntries:       stores.cycle.entries.length,
      cycleSymptoms:      stores.cycle.symptoms.length,
      cycleNotes:         stores.cycleNotes.notes?.length ?? 0,
      pregnancySet:       stores.pregnancy.pregnancy ? 1 : 0,
      appointments:       stores.pregnancy.appointments.length,
      exams:              stores.pregnancy.exams.length,
      journalEntries:     stores.pregnancy.journal.length,
      weightEntries:      stores.pregnancy.weightEntries.length,
      checklistItems:     stores.pregnancy.checklist.length,
      babies:             stores.baby.babies.length,
      growthEntries:      stores.baby.growthEntries.length,
      vaccineRecords:     stores.vaccines.records.length,
    };
  },
} as const;
