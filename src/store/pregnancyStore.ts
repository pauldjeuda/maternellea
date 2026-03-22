/**
 * store/pregnancyStore.ts  — FULL VERSION
 * pregnancy · appointments · exams · journal · weight · checklist
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  PregnancyProfile, Appointment, MedicalExam,
  PregnancyJournalEntry, WeightEntry,
} from '@types/models';
import { STORAGE_KEYS } from '@constants';
import { zustandMMKVStorage } from '@services/storage/StorageService';
import {
  MOCK_PREGNANCY, MOCK_APPOINTMENTS,
} from '@services/mocks/dashboardData';
import type { ChecklistItem } from '@features/pregnancy/types';
import { buildChecklist } from '@features/pregnancy/utils/pregnancyCalc';

// Late-import mocks to avoid circular dep
function getMocks() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('@features/pregnancy/services/pregnancyMocks') as {
    MOCK_EXAMS:            MedicalExam[];
    MOCK_JOURNAL:          PregnancyJournalEntry[];
    MOCK_WEIGHT_ENTRIES:   WeightEntry[];
    MOCK_CHECKLIST_ITEMS:  ChecklistItem[];
  };
}

interface PregnancyState {
  pregnancy:     PregnancyProfile | null;
  appointments:  Appointment[];
  exams:         MedicalExam[];
  journal:       PregnancyJournalEntry[];
  weightEntries: WeightEntry[];
  checklist:     ChecklistItem[];

  actions: {
    seed:                () => void;
    setPregnancy:        (p: PregnancyProfile) => void;
    addAppointment:      (a: Appointment) => void;
    updateAppointment:   (id: string, patch: Partial<Appointment>) => void;
    deleteAppointment:   (id: string) => void;
    completeAppointment: (id: string) => void;
    addExam:             (e: MedicalExam) => void;
    updateExam:          (id: string, patch: Partial<MedicalExam>) => void;
    deleteExam:          (id: string) => void;
    completeExam:        (id: string, result: string, completedDate: string) => void;
    addJournalEntry:     (e: PregnancyJournalEntry) => void;
    updateJournalEntry:  (id: string, patch: Partial<PregnancyJournalEntry>) => void;
    deleteJournalEntry:  (id: string) => void;
    addWeightEntry:      (e: WeightEntry) => void;
    updateWeightEntry:   (id: string, patch: Partial<WeightEntry>) => void;
    deleteWeightEntry:   (id: string) => void;
    toggleChecklistItem: (id: string) => void;
    resetChecklist:      () => void;
  };
}

export const usePregnancyStore = create<PregnancyState>()(
  persist(
    immer((set) => ({
      pregnancy:     null,
      appointments:  [],
      exams:         [],
      journal:       [],
      weightEntries: [],
      checklist:     [],

      actions: {
        seed: () => set((s) => {
          if (!s.pregnancy) {
            const m = getMocks();
            s.pregnancy     = MOCK_PREGNANCY;
            s.appointments  = MOCK_APPOINTMENTS;
            s.exams         = m.MOCK_EXAMS;
            s.journal       = m.MOCK_JOURNAL;
            s.weightEntries = m.MOCK_WEIGHT_ENTRIES;
            s.checklist     = buildChecklist(m.MOCK_CHECKLIST_ITEMS);
          }
        }),

        setPregnancy: (p) => set((s) => { s.pregnancy = p; }),

        addAppointment:   (a) => set((s) => { s.appointments.push(a); }),
        updateAppointment: (id, patch) => set((s) => {
          const i = s.appointments.findIndex(a => a.id === id);
          if (i !== -1) Object.assign(s.appointments[i]!, { ...patch, updatedAt: new Date().toISOString() });
        }),
        deleteAppointment: (id) => set((s) => {
          s.appointments = s.appointments.filter(a => a.id !== id);
        }),
        completeAppointment: (id) => set((s) => {
          const i = s.appointments.findIndex(a => a.id === id);
          if (i !== -1) { s.appointments[i]!.isCompleted = true; s.appointments[i]!.completedAt = new Date().toISOString(); }
        }),

        addExam:  (e) => set((s) => { s.exams.push(e); }),
        updateExam: (id, patch) => set((s) => {
          const i = s.exams.findIndex(e => e.id === id);
          if (i !== -1) Object.assign(s.exams[i]!, patch);
        }),
        deleteExam: (id) => set((s) => { s.exams = s.exams.filter(e => e.id !== id); }),
        completeExam: (id, result, completedDate) => set((s) => {
          const i = s.exams.findIndex(e => e.id === id);
          if (i !== -1) { s.exams[i]!.isCompleted = true; s.exams[i]!.result = result; s.exams[i]!.completedDate = completedDate; }
        }),

        addJournalEntry:    (e) => set((s) => { s.journal.push(e); }),
        updateJournalEntry: (id, patch) => set((s) => {
          const i = s.journal.findIndex(e => e.id === id);
          if (i !== -1) Object.assign(s.journal[i]!, { ...patch, updatedAt: new Date().toISOString() });
        }),
        deleteJournalEntry: (id) => set((s) => { s.journal = s.journal.filter(e => e.id !== id); }),

        addWeightEntry:    (e) => set((s) => { s.weightEntries.push(e); }),
        updateWeightEntry: (id, patch) => set((s) => {
          const i = s.weightEntries.findIndex(e => e.id === id);
          if (i !== -1) Object.assign(s.weightEntries[i]!, patch);
        }),
        deleteWeightEntry: (id) => set((s) => { s.weightEntries = s.weightEntries.filter(e => e.id !== id); }),

        toggleChecklistItem: (id) => set((s) => {
          const i = s.checklist.findIndex(c => c.id === id);
          if (i !== -1) {
            const item = s.checklist[i]!;
            item.isDone      = !item.isDone;
            item.completedAt = item.isDone ? new Date().toISOString() : undefined;
          }
        }),
        resetChecklist: () => set((s) => { s.checklist = buildChecklist([]); }),
      },
    })),
    {
      name:    STORAGE_KEYS.STORE_PREGNANCY,
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (s) => ({
        pregnancy: s.pregnancy, appointments: s.appointments, exams: s.exams,
        journal: s.journal, weightEntries: s.weightEntries, checklist: s.checklist,
      }),
    }
  )
);

export const selectPregnancy         = (s: PregnancyState) => s.pregnancy;
export const selectAppointments      = (s: PregnancyState) => s.appointments;
export const selectExams             = (s: PregnancyState) => s.exams;
export const selectJournal           = (s: PregnancyState) => s.journal;
export const selectWeightEntries     = (s: PregnancyState) => s.weightEntries;
export const selectChecklist         = (s: PregnancyState) => s.checklist;
export const selectPregnancyActions  = (s: PregnancyState) => s.actions;

export const selectNextAppointment   = (s: PregnancyState) =>
  [...s.appointments].filter(a => !a.isCompleted)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;

export const selectSortedAppointments = (s: PregnancyState) =>
  [...s.appointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

export const selectSortedExams       = (s: PregnancyState) =>
  [...s.exams].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

export const selectSortedJournal     = (s: PregnancyState) =>
  [...s.journal].sort((a, b) => b.date.localeCompare(a.date));

export const selectSortedWeight      = (s: PregnancyState) =>
  [...s.weightEntries].sort((a, b) => a.date.localeCompare(b.date));
