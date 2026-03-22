/**
 * store/authStore.ts
 * Authentication + user profile state.
 *
 * Persisted via MMKV (sync, no loading state on rehydration).
 * All auth-gated navigation derives from `isAuthenticated`
 * and `isOnboardingComplete` computed from this store.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { UserProfile, UserPhase } from '@types/models';
import { STORAGE_KEYS } from '@constants';
import { zustandMMKVStorage } from '@services/storage/StorageService';

// ─────────────────────────────────────────────────────────────
//  STATE SHAPE
// ─────────────────────────────────────────────────────────────

interface AuthState {
  // Data
  user:                  UserProfile | null;
  token:                 string | null;
  refreshToken:          string | null;
  isOnboardingComplete:  boolean;

  // Derived
  isAuthenticated: boolean;

  // Actions
  actions: {
    setUser:             (user: UserProfile) => void;
    setTokens:           (token: string, refreshToken?: string) => void;
    updateUser:          (patch: Partial<UserProfile>) => void;
    setActivePhase:      (phase: UserPhase) => void;
    completeOnboarding:  () => void;
    logout:              () => void;
  };
}

// ─────────────────────────────────────────────────────────────
//  STORE
// ─────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      user:                 null,
      token:                null,
      refreshToken:         null,
      isOnboardingComplete: false,
      isAuthenticated:      false,

      actions: {
        setUser: (user) =>
          set((state) => {
            state.user            = user;
            state.isAuthenticated = true;
          }),

        setTokens: (token, refreshToken) =>
          set((state) => {
            state.token        = token;
            state.refreshToken = refreshToken ?? null;
          }),

        updateUser: (patch) =>
          set((state) => {
            if (state.user) {
              Object.assign(state.user, patch);
              state.user.updatedAt = new Date().toISOString();
            }
          }),

        setActivePhase: (phase) =>
          set((state) => {
            if (state.user) state.user.activePhase = phase;
          }),

        completeOnboarding: () =>
          set((state) => {
            state.isOnboardingComplete = true;
          }),

        logout: () =>
          set((state) => {
            state.user                 = null;
            state.token                = null;
            state.refreshToken         = null;
            state.isAuthenticated      = false;
            state.isOnboardingComplete = false;
          }),
      },
    })),
    {
      name:    STORAGE_KEYS.STORE_AUTH,
      storage: createJSONStorage(() => zustandMMKVStorage),
      // Only persist data, never actions
      partialize: (state) => ({
        user:                 state.user,
        token:                state.token,
        refreshToken:         state.refreshToken,
        isOnboardingComplete: state.isOnboardingComplete,
        isAuthenticated:      state.isAuthenticated,
      }),
    }
  )
);

// ─────────────────────────────────────────────────────────────
//  SELECTORS  (stable references — use these, not inline selectors)
// ─────────────────────────────────────────────────────────────

export const selectUser          = (s: AuthState) => s.user;
export const selectToken         = (s: AuthState) => s.token;
export const selectIsAuth        = (s: AuthState) => s.isAuthenticated;
export const selectIsOnboarded   = (s: AuthState) => s.isOnboardingComplete;
export const selectActivePhase   = (s: AuthState) => s.user?.activePhase ?? 'cycle';
export const selectAuthActions   = (s: AuthState) => s.actions;
