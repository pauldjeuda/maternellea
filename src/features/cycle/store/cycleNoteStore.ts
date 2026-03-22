/**
 * features/cycle/store/cycleNoteStore.ts
 *
 * Extends the cycle domain with daily notes — kept in a separate
 * store to avoid touching the already-wired cycleStore.ts.
 * Both stores are consumed together via useCycleData hook.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { zustandMMKVStorage } from '@services/storage/StorageService';
import type { DailyNote } from '../types';
import { genId } from '../utils/cycleCalc';
import { subDays, format } from 'date-fns';

// ─── Mock seed ───────────────────────────────────────────────

const today = new Date();
const s = (n: number) => format(subDays(today, n), 'yyyy-MM-dd');

const SEED_NOTES: DailyNote[] = [
  {
    id: 'note-001', date: s(1),
    text: 'Journée calme. Légère sensibilité au niveau des seins en soirée.',
    createdAt: s(1) + 'T21:30:00Z',
  },
  {
    id: 'note-002', date: s(3),
    text: "Fatigue importante cet après-midi. J'ai fait une sieste d'une heure.",
    createdAt: s(3) + 'T16:00:00Z',
  },
  {
    id: 'note-003', date: s(7),
    text: "Belle énergie aujourd'hui. Bonne humeur générale, aucun symptôme notable.",
    createdAt: s(7) + 'T19:00:00Z',
  },
];

// ─────────────────────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────────────────────

interface NoteState {
  notes: DailyNote[];

  actions: {
    seed:           () => void;
    upsertNote:     (date: string, text: string) => DailyNote;
    deleteNote:     (id: string) => void;
    getNoteByDate:  (date: string) => DailyNote | undefined;
  };
}

export const useCycleNoteStore = create<NoteState>()(
  persist(
    immer((set, get) => ({
      notes: [],

      actions: {
        seed: () => set((s) => {
          if (s.notes.length === 0) s.notes = SEED_NOTES;
        }),

        upsertNote: (date, text) => {
          const existing = get().notes.find(n => n.date === date);
          const now      = new Date().toISOString();

          if (existing) {
            const updated: DailyNote = { ...existing, text, updatedAt: now };
            set(s => {
              const idx = s.notes.findIndex(n => n.date === date);
              if (idx !== -1) s.notes[idx] = updated;
            });
            return updated;
          } else {
            const created: DailyNote = {
              id: genId('note'), date, text, createdAt: now,
            };
            set(s => { s.notes.push(created); });
            return created;
          }
        },

        deleteNote: (id) => set(s => {
          s.notes = s.notes.filter(n => n.id !== id);
        }),

        getNoteByDate: (date) => get().notes.find(n => n.date === date),
      },
    })),
    {
      name:    'store/cycle-notes',
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (s) => ({ notes: s.notes }),
    }
  )
);

export const selectNotes       = (s: NoteState) => s.notes;
export const selectNoteActions = (s: NoteState) => s.actions;
