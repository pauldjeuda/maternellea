/**
 * store/vaccineStore.ts
 *
 * Dedicated store slice for vaccine records.
 * Reads babies from babyStore (single source of truth for baby profiles).
 * Vaccine records are the user-side data; definitions come from scheduleRegistry.
 *
 * Separated from babyStore to keep each store focused.
 * Both stores are consumed together in useVaccineData hook.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { VaccineRecord, VaccineStatus } from '@types/models';
import { zustandMMKVStorage } from '@services/storage/StorageService';
import { MOCK_VACCINE_RECORDS } from '@services/mocks/dashboardData';

// ─────────────────────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────────────────────

interface VaccineState {
  records: VaccineRecord[];

  actions: {
    seed:          () => void;

    // Manually record a vaccine (creates a new record for a definition)
    addRecord:     (record: VaccineRecord) => void;

    // Mark an existing pending record as done
    markDone: (
      id: string,
      payload: {
        administeredDate: string;
        administeredBy?:  string;
        location?:        string;
        batchNumber?:     string;
        sideEffects?:     string;
        notes?:           string;
      }
    ) => void;

    // Update any field on a record
    updateRecord:  (id: string, patch: Partial<VaccineRecord>) => void;

    // Delete a record (e.g. entered by mistake)
    deleteRecord:  (id: string) => void;

    // Skip a vaccine (documented refusal / medical contraindication)
    skipRecord:    (id: string, reason?: string) => void;

    // Queries
    getByBaby:     (babyId: string) => VaccineRecord[];
    getById:       (id: string) => VaccineRecord | undefined;
    getByVaccineId:(babyId: string, vaccineId: string) => VaccineRecord | undefined;
    reset:         () => void;
  };
}

// ─────────────────────────────────────────────────────────────
//  STORE
// ─────────────────────────────────────────────────────────────

export const useVaccineStore = create<VaccineState>()(
  persist(
    immer((set, get) => ({
      records: [],

      actions: {
        seed: () => set((s) => {
          if (s.records.length === 0) {
            s.records = MOCK_VACCINE_RECORDS;
          }
        }),

        addRecord: (record) => set((s) => {
          s.records.push(record);
        }),

        markDone: (id, payload) => set((s) => {
          const i = s.records.findIndex(r => r.id === id);
          if (i !== -1) {
            const rec = s.records[i]!;
            rec.status           = 'done';
            rec.administeredDate = payload.administeredDate;
            rec.administeredBy   = payload.administeredBy;
            rec.location         = payload.location;
            rec.batchNumber      = payload.batchNumber;
            rec.sideEffects      = payload.sideEffects;
            rec.notes            = payload.notes;
            rec.updatedAt        = new Date().toISOString();
          }
        }),

        updateRecord: (id, patch) => set((s) => {
          const i = s.records.findIndex(r => r.id === id);
          if (i !== -1) Object.assign(s.records[i]!, { ...patch, updatedAt: new Date().toISOString() });
        }),

        deleteRecord: (id) => set((s) => {
          s.records = s.records.filter(r => r.id !== id);
        }),

        skipRecord: (id, reason) => set((s) => {
          const i = s.records.findIndex(r => r.id === id);
          if (i !== -1) {
            s.records[i]!.status    = 'skipped';
            s.records[i]!.notes     = reason;
            s.records[i]!.updatedAt = new Date().toISOString();
          }
        }),

        getByBaby: (babyId) =>
          get().records.filter(r => r.babyId === babyId),

        getById: (id) =>
          get().records.find(r => r.id === id),

        getByVaccineId: (babyId, vaccineId) =>
          get().records.find(r => r.babyId === babyId && r.vaccineId === vaccineId),

        reset: () => set((s) => { s.records = []; }),
      },
    })),
    {
      name:    'store/vaccines',
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (s) => ({ records: s.records }),
    }
  )
);

// ─────────────────────────────────────────────────────────────
//  SELECTORS
// ─────────────────────────────────────────────────────────────

export const selectVaccineRecords  = (s: VaccineState) => s.records;
export const selectVaccineActions  = (s: VaccineState) => s.actions;
