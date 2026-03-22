/**
 * features/profile/store/preferencesStore.ts
 *
 * Stores local app preferences (theme, units, haptics, …).
 * Separate from authStore so preferences survive logout.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { zustandMMKVStorage } from '@services/storage/StorageService';
import { DEFAULT_PREFERENCES, type AppPreferences } from '../types';

interface PrefState {
  prefs: AppPreferences;
  actions: {
    update: (patch: Partial<AppPreferences>) => void;
    reset:  () => void;
  };
}

export const usePreferencesStore = create<PrefState>()(
  persist(
    immer((set) => ({
      prefs: { ...DEFAULT_PREFERENCES },
      actions: {
        update: (patch) => set((s) => { Object.assign(s.prefs, patch); }),
        reset:  ()      => set((s) => { s.prefs = { ...DEFAULT_PREFERENCES }; }),
      },
    })),
    {
      name:    'store/preferences',
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (s) => ({ prefs: s.prefs }),
    }
  )
);

export const selectPrefs   = (s: PrefState) => s.prefs;
export const selectPrefAct = (s: PrefState) => s.actions;
