/**
 * features/profile/hooks/useProfileData.ts
 *
 * Single hook for all profile screens.
 * Bridges authStore (user data) + preferencesStore (local prefs).
 * Screens never import stores directly.
 */

import { useAuthStore, selectUser, selectAuthActions } from '@store/authStore';
import { usePreferencesStore, selectPrefs, selectPrefAct } from '../store/preferencesStore';
import { authService } from '@features/auth/services/authService';
import type { EditProfileFormValues, NotifPrefsFormValues } from '../types';

export function useProfileData() {
  const user       = useAuthStore(selectUser);
  const authAct    = useAuthStore(selectAuthActions);
  const prefs      = usePreferencesStore(selectPrefs);
  const prefAct    = usePreferencesStore(selectPrefAct);

  // ── Profile mutations ───────────────────────────────────────

  function saveProfile(values: EditProfileFormValues) {
    authAct.updateUser({
      firstName:   values.firstName,
      dateOfBirth: values.dateOfBirth,
      country:     values.country,
      language:    values.language,
    });
  }

  function saveNotifPrefs(values: NotifPrefsFormValues) {
    authAct.updateUser({
      notificationsEnabled:       values.notificationsEnabled,
      cycleReminderEnabled:       values.cycleReminderEnabled,
      appointmentReminderEnabled: values.appointmentReminderEnabled,
      vaccineReminderEnabled:     values.vaccineReminderEnabled,
      weeklyDigestEnabled:        values.weeklyDigestEnabled,
    });
  }

  function changePhase(phase: 'cycle' | 'pregnancy' | 'postpartum') {
    authAct.setActivePhase(phase);
  }

  async function logout() {
    try {
      const token = useAuthStore.getState().token;
      if (token) await authService.signOut(token);
    } catch {
      // Ignore API errors on logout — always clear local state
    }
    authAct.logout();
  }

  // ── Preferences mutations ───────────────────────────────────

  function updatePref<K extends keyof typeof prefs>(key: K, value: typeof prefs[K]) {
    prefAct.update({ [key]: value });
  }

  return {
    user,
    prefs,
    // Profile
    saveProfile,
    saveNotifPrefs,
    changePhase,
    logout,
    // Prefs
    updatePref,
    resetPrefs: prefAct.reset,
  };
}
