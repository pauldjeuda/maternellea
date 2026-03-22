/**
 * features/advice/store/adviceStore.ts
 *
 * Stores user-facing article state: favorites and read history.
 * Article content itself lives in articleMocks (static / future API).
 *
 * Designed to be swapped for an API layer: the hook useAdviceData
 * is the only consumer — screens never touch this store directly.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { zustandMMKVStorage } from '@services/storage/StorageService';

// ─────────────────────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────────────────────

interface AdviceStoreState {
  /** Article IDs the user has bookmarked as favorites */
  favorites:   string[];
  /** Article IDs the user has opened at least once */
  readHistory: string[];

  actions: {
    toggleFavorite: (id: string) => void;
    markRead:       (id: string) => void;
    clearHistory:   () => void;
    isFavorite:     (id: string) => boolean;
    isRead:         (id: string) => boolean;
  };
}

// ─────────────────────────────────────────────────────────────
//  STORE
// ─────────────────────────────────────────────────────────────

export const useAdviceStore = create<AdviceStoreState>()(
  persist(
    immer((set, get) => ({
      favorites:   [],
      readHistory: [],

      actions: {
        toggleFavorite: (id) => set((s) => {
          const idx = s.favorites.indexOf(id);
          if (idx === -1) {
            s.favorites.push(id);
          } else {
            s.favorites.splice(idx, 1);
          }
        }),

        markRead: (id) => set((s) => {
          if (!s.readHistory.includes(id)) {
            s.readHistory.push(id);
          }
        }),

        clearHistory: () => set((s) => { s.readHistory = []; }),

        isFavorite: (id) => get().favorites.includes(id),
        isRead:     (id) => get().readHistory.includes(id),
      },
    })),
    {
      name:    'store/advice',
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (s) => ({
        favorites:   s.favorites,
        readHistory: s.readHistory,
      }),
    }
  )
);

export const selectFavorites    = (s: AdviceStoreState) => s.favorites;
export const selectReadHistory  = (s: AdviceStoreState) => s.readHistory;
export const selectAdviceActions = (s: AdviceStoreState) => s.actions;
