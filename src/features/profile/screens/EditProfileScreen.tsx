/**
 * features/profile/screens/EditProfileScreen.tsx
 *
 * Formulaire d'édition du profil utilisateur.
 * Champs : prénom, date de naissance, pays, langue.
 * Validation Zod via React Hook Form.
 */

import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { tokens } from '@theme/tokens';
import { Input, Button } from '@components/ui';
import { COUNTRIES } from '@constants';
import { useProfileData } from '../hooks/useProfileData';
import { FormField } from '../components/ProfileUI';
import { editProfileSchema, type EditProfileFormValues } from '../types';

const { colors, spacing, radius, fontSize, fontWeight, shadows } = tokens;

// ─── Country picker (simple scroll list in an inline picker) ─

interface CountryPickerProps {
  value:    string;
  onChange: (code: string) => void;
  error?:   string;
}

function CountryPicker({ value, onChange, error }: CountryPickerProps) {
  const selected = COUNTRIES.find(c => c.code === value);
  const [open, setOpen] = React.useState(false);

  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpen(v => !v)}
        style={[
          cpS.trigger,
          open && { borderColor: colors.borderFocus, backgroundColor: colors.surface },
          !!error && { borderColor: colors.error, backgroundColor: colors.errorLight },
        ]}
      >
        <Text style={cpS.triggerText}>
          {selected ? selected.name : 'Choisir un pays'}
        </Text>
        <Text style={{ fontSize: 14, color: colors.textTertiary }}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {!!error && (
        <Text style={{ fontSize: fontSize.xs, color: colors.errorText, marginTop: spacing[0.5] }}>
          ⚠ {error}
        </Text>
      )}
      {open && (
        <View style={cpS.dropdown}>
          <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {COUNTRIES.map(c => (
              <TouchableOpacity
                key={c.code}
                onPress={() => { onChange(c.code); setOpen(false); }}
                style={[cpS.option, c.code === value && cpS.optionActive]}
              >
                <Text style={[cpS.optionText, c.code === value && cpS.optionTextActive]}>
                  {c.code === value ? '✓  ' : '    '}{c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const cpS = StyleSheet.create({
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border,
    minHeight: 52, paddingHorizontal: spacing[4],
  },
  triggerText: { fontSize: fontSize.base, color: colors.textPrimary, flex: 1 },
  dropdown: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.borderFocus,
    marginTop: spacing[1], ...shadows.md, overflow: 'hidden',
  },
  option:          { paddingVertical: spacing[3], paddingHorizontal: spacing[4] },
  optionActive:    { backgroundColor: colors.primaryLight },
  optionText:      { fontSize: fontSize.base, color: colors.textPrimary },
  optionTextActive: { color: colors.primary, fontWeight: fontWeight.semiBold },
});

// ─────────────────────────────────────────────────────────────
//  LANGUAGE PICKER
// ─────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'en', label: '🇬🇧 English' },
];

// ─────────────────────────────────────────────────────────────
//  SCREEN
// ─────────────────────────────────────────────────────────────

export function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, saveProfile } = useProfileData();

  const {
    control, handleSubmit, reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EditProfileFormValues>({
    resolver:      zodResolver(editProfileSchema),
    defaultValues: {
      firstName:   user?.firstName   ?? '',
      dateOfBirth: user?.dateOfBirth ?? '',
      country:     user?.country     ?? 'FR',
      language:    (user?.language as 'fr' | 'en') ?? 'fr',
    },
  });

  // Sync form if user changes externally
  useEffect(() => {
    if (user) {
      reset({
        firstName:   user.firstName,
        dateOfBirth: user.dateOfBirth ?? '',
        country:     user.country,
        language:    (user.language as 'fr' | 'en') ?? 'fr',
      });
    }
  }, [user?.updatedAt]);

  function onSubmit(values: EditProfileFormValues) {
    saveProfile(values);
    navigation.goBack();
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >

      {/* ── PRÉNOM ────────────────────────────────────────── */}
      <FormField label="Prénom" required>
        <Controller name="firstName" control={control} render={({ field }) => (
          <Input
            value={field.value}
            onChangeText={field.onChange}
            placeholder="Votre prénom"
            autoCapitalize="words"
            autoCorrect={false}
            error={errors.firstName?.message}
          />
        )} />
      </FormField>

      {/* ── DATE DE NAISSANCE ─────────────────────────────── */}
      <FormField label="Date de naissance" hint="Format : AAAA-MM-JJ · Optionnel">
        <Controller name="dateOfBirth" control={control} render={({ field }) => (
          <Input
            value={field.value ?? ''}
            onChangeText={field.onChange}
            placeholder="1990-01-15"
            keyboardType="numeric"
            maxLength={10}
            error={errors.dateOfBirth?.message}
          />
        )} />
      </FormField>

      {/* ── PAYS ──────────────────────────────────────────── */}
      <FormField label="Pays" required>
        <Controller name="country" control={control} render={({ field }) => (
          <CountryPicker
            value={field.value}
            onChange={field.onChange}
            error={errors.country?.message}
          />
        )} />
      </FormField>

      {/* ── LANGUE ────────────────────────────────────────── */}
      <FormField label="Langue de l'application">
        <Controller name="language" control={control} render={({ field }) => (
          <View style={s.langRow}>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => field.onChange(lang.code)}
                style={[
                  s.langBtn,
                  field.value === lang.code && s.langBtnActive,
                ]}
              >
                <Text style={[
                  s.langLabel,
                  field.value === lang.code && { color: colors.primary, fontWeight: fontWeight.semiBold },
                ]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )} />
      </FormField>

      {/* ── SUBMIT ────────────────────────────────────────── */}
      <Button
        label="Enregistrer"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={!isDirty}
        fullWidth
        size="lg"
        style={{ marginTop: spacing[4] }}
      />

      <Button
        label="Annuler"
        variant="ghost"
        onPress={() => navigation.goBack()}
        fullWidth
        style={{ marginTop: spacing[2] }}
      />

    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: spacing[5], gap: spacing[5], paddingBottom: spacing[12] },
  langRow: { flexDirection: 'row', gap: spacing[3] },
  langBtn: {
    flex: 1, paddingVertical: spacing[3], alignItems: 'center',
    borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  langBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  langLabel:     { fontSize: fontSize.base, color: colors.textSecondary },
});
