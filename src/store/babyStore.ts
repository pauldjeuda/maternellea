/**
 * store/babyStore.ts  — FULL VERSION
 * babies · growth · vaccines · postpartum entries · health notes
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { BabyProfile, GrowthEntry, VaccineRecord, PostpartumEntry, VaccineStatus } from '@types/models';
import { STORAGE_KEYS } from '@constants';
import { zustandMMKVStorage } from '@services/storage/StorageService';
import {
  MOCK_BABY, MOCK_GROWTH_ENTRIES, MOCK_VACCINE_RECORDS,
} from '@services/mocks/dashboardData';
import type { HealthNote } from '@features/postpartum/types';

function getExtraMocks() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('@features/postpartum/services/postpartumMocks') as {
    MOCK_HEALTH_NOTES:    HealthNote[];
    MOCK_POSTPARTUM_FULL: PostpartumEntry[];
  };
}

interface BabyState {
  babies:            BabyProfile[];
  growthEntries:     GrowthEntry[];
  vaccineRecords:    VaccineRecord[];
  postpartumEntries: PostpartumEntry[];
  healthNotes:       HealthNote[];

  actions: {
    seed:                  () => void;
    addBaby:               (b: BabyProfile) => void;
    updateBaby:            (id: string, patch: Partial<BabyProfile>) => void;
    deleteBaby:            (id: string) => void;
    setActiveBaby:         (id: string) => void;
    addGrowthEntry:        (e: GrowthEntry) => void;
    updateGrowthEntry:     (id: string, patch: Partial<GrowthEntry>) => void;
    deleteGrowthEntry:     (id: string) => void;
    markVaccineDone:       (id: string, opts: { administeredDate: string; administeredBy?: string; notes?: string }) => void;
    addPostpartumEntry:    (e: PostpartumEntry) => void;
    updatePostpartumEntry: (id: string, patch: Partial<PostpartumEntry>) => void;
    deletePostpartumEntry: (id: string) => void;
    addHealthNote:         (note: HealthNote) => void;
    updateHealthNote:      (id: string, patch: Partial<HealthNote>) => void;
    deleteHealthNote:      (id: string) => void;
    getActiveBaby:         () => BabyProfile | undefined;
    getGrowthForBaby:      (babyId: string) => GrowthEntry[];
    getLatestGrowth:       (babyId: string) => GrowthEntry | undefined;
    getNextVaccine:        (babyId: string) => VaccineRecord | undefined;
    getHealthNotes:        (babyId: string) => HealthNote[];
  };
}

export const useBabyStore = create<BabyState>()(
  persist(
    immer((set, get) => ({
      babies:            [],
      growthEntries:     [],
      vaccineRecords:    [],
      postpartumEntries: [],
      healthNotes:       [],

      actions: {
        seed: () => set((s) => {
          if (s.babies.length === 0) {
            const m = getExtraMocks();
            s.babies            = [MOCK_BABY];
            s.growthEntries     = MOCK_GROWTH_ENTRIES;
            s.vaccineRecords    = MOCK_VACCINE_RECORDS;
            s.postpartumEntries = m.MOCK_POSTPARTUM_FULL;
            s.healthNotes       = m.MOCK_HEALTH_NOTES;
          }
        }),

        addBaby:    (b) => set((s) => { s.babies.push(b); }),
        updateBaby: (id, patch) => set((s) => {
          const i = s.babies.findIndex(b => b.id === id);
          if (i !== -1) Object.assign(s.babies[i]!, { ...patch, updatedAt: new Date().toISOString() });
        }),
        deleteBaby:    (id) => set((s) => { s.babies = s.babies.filter(b => b.id !== id); }),
        setActiveBaby: (id) => set((s) => { s.babies.forEach(b => { b.isActive = b.id === id; }); }),

        addGrowthEntry:    (e) => set((s) => { s.growthEntries.push(e); }),
        updateGrowthEntry: (id, patch) => set((s) => {
          const i = s.growthEntries.findIndex(g => g.id === id);
          if (i !== -1) Object.assign(s.growthEntries[i]!, patch);
        }),
        deleteGrowthEntry: (id) => set((s) => { s.growthEntries = s.growthEntries.filter(g => g.id !== id); }),

        markVaccineDone: (id, opts) => set((s) => {
          const i = s.vaccineRecords.findIndex(v => v.id === id);
          if (i !== -1) {
            s.vaccineRecords[i]!.status           = 'done';
            s.vaccineRecords[i]!.administeredDate = opts.administeredDate;
            s.vaccineRecords[i]!.administeredBy   = opts.administeredBy;
            s.vaccineRecords[i]!.notes            = opts.notes;
            s.vaccineRecords[i]!.updatedAt        = new Date().toISOString();
          }
        }),

        addPostpartumEntry:    (e) => set((s) => { s.postpartumEntries.push(e); }),
        updatePostpartumEntry: (id, patch) => set((s) => {
          const i = s.postpartumEntries.findIndex(e => e.id === id);
          if (i !== -1) Object.assign(s.postpartumEntries[i]!, patch);
        }),
        deletePostpartumEntry: (id) => set((s) => { s.postpartumEntries = s.postpartumEntries.filter(e => e.id !== id); }),

        addHealthNote:    (note) => set((s) => { s.healthNotes.push(note); }),
        updateHealthNote: (id, patch) => set((s) => {
          const i = s.healthNotes.findIndex(n => n.id === id);
          if (i !== -1) Object.assign(s.healthNotes[i]!, { ...patch, updatedAt: new Date().toISOString() });
        }),
        deleteHealthNote: (id) => set((s) => { s.healthNotes = s.healthNotes.filter(n => n.id !== id); }),

        getActiveBaby:  () => get().babies.find(b => b.isActive),
        getGrowthForBaby: (babyId) =>
          [...get().growthEntries].filter(g => g.babyId === babyId).sort((a, b) => a.date.localeCompare(b.date)),
        getLatestGrowth: (babyId) =>
          [...get().growthEntries].filter(g => g.babyId === babyId).sort((a, b) => b.date.localeCompare(a.date))[0],
        getNextVaccine: (babyId) =>
          [...get().vaccineRecords]
            .filter(v => v.babyId === babyId && (v.status === 'due_soon' || v.status === 'overdue' || v.status === 'upcoming'))
            .sort((a, b) => {
              const p: Record<VaccineStatus, number> = { overdue: 0, due_soon: 1, upcoming: 2, done: 3, skipped: 4 };
              return (p[a.status] - p[b.status]) || (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? '');
            })[0],
        getHealthNotes: (babyId) =>
          [...get().healthNotes].filter(n => n.babyId === babyId).sort((a, b) => b.date.localeCompare(a.date)),
      },
    })),
    {
      name:    STORAGE_KEYS.STORE_BABY,
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (s) => ({
        babies: s.babies, growthEntries: s.growthEntries,
        vaccineRecords: s.vaccineRecords, postpartumEntries: s.postpartumEntries,
        healthNotes: s.healthNotes,
      }),
    }
  )
);

export const selectBabies            = (s: BabyState) => s.babies;
export const selectAllGrowthEntries  = (s: BabyState) => s.growthEntries;
export const selectVaccineRecords    = (s: BabyState) => s.vaccineRecords;
export const selectPostpartumEntries = (s: BabyState) => s.postpartumEntries;
export const selectHealthNotes       = (s: BabyState) => s.healthNotes;
export const selectBabyActions       = (s: BabyState) => s.actions;
export const selectActiveBaby        = (s: BabyState) => s.babies.find(b => b.isActive) ?? s.babies[0] ?? null;
export const selectSortedPostpartum  = (s: BabyState) =>
  [...s.postpartumEntries].sort((a, b) => b.date.localeCompare(a.date));
