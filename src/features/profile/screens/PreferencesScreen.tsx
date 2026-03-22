/**
 * features/profile/screens/PreferencesScreen.tsx
 *
 * Préférences de l'application.
 * Thème, unités, retour haptique, format de date.
 * Sauvegarde immédiate via usePreferencesStore.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { tokens } from '@theme/tokens';
import { useProfileData } from '../hooks/useProfileData';
import {
  SettingsGroup, SectionLabel, ToggleRow, SegmentControl, FormField,
} from '../components/ProfileUI';

const { colors, spacing, fontSize } = tokens;

export function PreferencesScreen() {
  const { prefs, updatePref } = useProfileData();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >

      {/* ── APPARENCE ─────────────────────────────────────── */}
      <View style={s.group}>
        <SectionLabel>Apparence</SectionLabel>
        <SettingsGroup>
          <View style={s.segRow}>
            <Text style={s.segLabel}>Thème</Text>
            <SegmentControl
              options={[
                { label: '☀️ Clair',   value: 'light'  },
                { label: '🌙 Sombre',  value: 'dark'   },
                { label: '⚙️ Système', value: 'system' },
              ]}
              value={prefs.theme}
              onChange={v => updatePref('theme', v as typeof prefs.theme)}
            />
          </View>
        </SettingsGroup>
      </View>

      {/* ── UNITÉS ────────────────────────────────────────── */}
      <View style={s.group}>
        <SectionLabel>Unités</SectionLabel>
        <SettingsGroup>
          <View style={s.segRow}>
            <Text style={s.segLabel}>Poids</Text>
            <SegmentControl
              options={[
                { label: 'Kilogrammes (kg)', value: 'kg'  },
                { label: 'Livres (lbs)',      value: 'lbs' },
              ]}
              value={prefs.weightUnit}
              onChange={v => updatePref('weightUnit', v as typeof prefs.weightUnit)}
            />
          </View>
          <View style={[s.segRow, { borderTopWidth: 1, borderTopColor: colors.borderLight }]}>
            <Text style={s.segLabel}>Taille</Text>
            <SegmentControl
              options={[
                { label: 'Centimètres (cm)', value: 'cm' },
                { label: 'Pouces (in)',       value: 'in' },
              ]}
              value={prefs.heightUnit}
              onChange={v => updatePref('heightUnit', v as typeof prefs.heightUnit)}
            />
          </View>
        </SettingsGroup>
      </View>

      {/* ── FORMAT DE DATE ────────────────────────────────── */}
      <View style={s.group}>
        <SectionLabel>Format de date</SectionLabel>
        <SettingsGroup>
          <View style={s.segRow}>
            <SegmentControl
              options={[
                { label: 'JJ/MM/AAAA', value: 'DD/MM/YYYY' },
                { label: 'MM/JJ/AAAA', value: 'MM/DD/YYYY' },
                { label: 'AAAA-MM-JJ', value: 'YYYY-MM-DD' },
              ]}
              value={prefs.dateFormat}
              onChange={v => updatePref('dateFormat', v as typeof prefs.dateFormat)}
            />
          </View>
        </SettingsGroup>
      </View>

      {/* ── ACCESSIBILITÉ ─────────────────────────────────── */}
      <View style={s.group}>
        <SectionLabel>Accessibilité</SectionLabel>
        <SettingsGroup>
          <ToggleRow
            icon="📳"
            label="Retour haptique"
            subtitle="Vibrations légères lors des interactions"
            value={prefs.useHaptics}
            onToggle={v => updatePref('useHaptics', v)}
            isLast
            accent={colors.secondary}
          />
        </SettingsGroup>
      </View>

      {/* ── NOTE ──────────────────────────────────────────── */}
      <Text style={s.note}>
        Certaines préférences (thème sombre, biométrie) seront disponibles dans une prochaine version.
      </Text>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: spacing[5], gap: spacing[5], paddingBottom: spacing[12] },
  group:   { gap: spacing[2] },
  segRow:  { padding: spacing[4], gap: spacing[3] },
  segLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textPrimary },
  note:    { fontSize: fontSize.xs, color: colors.textTertiary, textAlign: 'center', paddingHorizontal: spacing[4], lineHeight: fontSize.xs * 1.6 },
});
