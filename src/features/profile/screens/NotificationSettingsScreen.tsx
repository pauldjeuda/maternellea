/**
 * features/profile/screens/NotificationSettingsScreen.tsx
 *
 * Gestion des préférences de notification.
 * - Interrupteur maître (désactive tout)
 * - Rappels cycle, RDV, vaccins, digest hebdo
 * - Sauvegarde immédiate (pas de bouton submit)
 */

import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { tokens } from '@theme/tokens';
import { useProfileData } from '../hooks/useProfileData';
import { ToggleRow, SettingsGroup, SectionLabel } from '../components/ProfileUI';
import { notifPrefsSchema, type NotifPrefsFormValues } from '../types';

const { colors, spacing, fontSize, fontWeight } = tokens;

export function NotificationSettingsScreen() {
  const { user, saveNotifPrefs } = useProfileData();

  const { watch, setValue, reset } = useForm<NotifPrefsFormValues>({
    resolver:      zodResolver(notifPrefsSchema),
    defaultValues: {
      notificationsEnabled:       user?.notificationsEnabled        ?? true,
      cycleReminderEnabled:       user?.cycleReminderEnabled        ?? true,
      appointmentReminderEnabled: user?.appointmentReminderEnabled  ?? true,
      vaccineReminderEnabled:     user?.vaccineReminderEnabled      ?? true,
      weeklyDigestEnabled:        user?.weeklyDigestEnabled         ?? true,
    },
  });

  const values  = watch();
  const master  = values.notificationsEnabled;

  // Auto-save on any change
  useEffect(() => {
    saveNotifPrefs(values);
  }, [JSON.stringify(values)]);

  // Sync when user changes externally
  useEffect(() => {
    if (user) {
      reset({
        notificationsEnabled:       user.notificationsEnabled,
        cycleReminderEnabled:       user.cycleReminderEnabled,
        appointmentReminderEnabled: user.appointmentReminderEnabled,
        vaccineReminderEnabled:     user.vaccineReminderEnabled,
        weeklyDigestEnabled:        user.weeklyDigestEnabled,
      });
    }
  }, [user?.updatedAt]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >

      {/* ── INTERRUPTEUR MAÎTRE ───────────────────────────── */}
      <View style={s.group}>
        <SectionLabel>Global</SectionLabel>
        <SettingsGroup>
          <ToggleRow
            icon="🔔"
            label="Notifications activées"
            subtitle="Active ou désactive toutes les notifications"
            value={master}
            onToggle={v => setValue('notificationsEnabled', v)}
            isLast
          />
        </SettingsGroup>
      </View>

      {/* ── RAPPELS SPÉCIFIQUES ───────────────────────────── */}
      <View style={s.group}>
        <SectionLabel>Rappels</SectionLabel>
        <SettingsGroup>
          <ToggleRow
            icon="🌙"
            label="Rappels cycle"
            subtitle="Prochaines règles, fenêtre fertile"
            value={values.cycleReminderEnabled}
            onToggle={v => setValue('cycleReminderEnabled', v)}
            disabled={!master}
            accent={colors.phaseCycle}
          />
          <ToggleRow
            icon="📋"
            label="Rendez-vous médicaux"
            subtitle="Rappels avant chaque consultation"
            value={values.appointmentReminderEnabled}
            onToggle={v => setValue('appointmentReminderEnabled', v)}
            disabled={!master}
            accent={colors.phasePregnancy}
          />
          <ToggleRow
            icon="💉"
            label="Vaccins bébé"
            subtitle="Alerte quand un vaccin approche"
            value={values.vaccineReminderEnabled}
            onToggle={v => setValue('vaccineReminderEnabled', v)}
            disabled={!master}
            accent={colors.fertile}
          />
          <ToggleRow
            icon="📰"
            label="Récapitulatif hebdomadaire"
            subtitle="Un résumé de votre semaine chaque lundi"
            value={values.weeklyDigestEnabled}
            onToggle={v => setValue('weeklyDigestEnabled', v)}
            disabled={!master}
            isLast
            accent={colors.accent}
          />
        </SettingsGroup>
      </View>

      {/* ── NOTE ──────────────────────────────────────────── */}
      <View style={s.note}>
        <Text style={{ fontSize: 16 }}>ℹ️</Text>
        <Text style={s.noteText}>
          Les notifications sont gérées par votre appareil.
          Vérifiez les paramètres système si vous ne les recevez pas.
        </Text>
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: spacing[5], gap: spacing[5], paddingBottom: spacing[12] },
  group:   { gap: spacing[2] },
  note: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3],
    backgroundColor: colors.infoLight, borderRadius: spacing[3],
    padding: spacing[4], borderWidth: 1, borderColor: colors.info + '33',
  },
  noteText: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: fontSize.sm * 1.55 },
});
