/**
 * features/postpartum/screens/AddPostpartumEntryScreen.tsx
 * React Hook Form + Zod — add or edit a daily postpartum entry.
 */

import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { tokens } from '@theme/tokens';
import { Input, Button } from '@components/ui';
import { todayISO } from '@utils/date';
import { usePostpartumData } from '../hooks/usePostpartumData';
import { ScaleRow, SymptomChips } from '../components/PostpartumUI';
import { postpartumEntrySchema, type PostpartumEntryFormValues } from '../types';
import type { PostpartumStackParams } from '@types/navigation';

const { colors, spacing, radius, fontSize, fontWeight } = tokens;
type Route = RouteProp<PostpartumStackParams, 'AddPostpartumEntry'>;

function SectionLabel({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textPrimary, marginBottom: spacing[2] }}>
      {children}
    </Text>
  );
}

export function AddPostpartumEntryScreen() {
  const navigation = useNavigation();
  const route      = useRoute<Route>();
  const editId     = route.params?.entryId;
  const { getEntryById, saveEntry } = usePostpartumData();
  const existing   = editId ? getEntryById(editId) : undefined;

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PostpartumEntryFormValues>({
    resolver:      zodResolver(postpartumEntrySchema),
    defaultValues: {
      date:            todayISO(),
      mood:            3,
      fatigue:         3,
      pain:            0,
      symptoms:        [],
      isBreastfeeding: false,
      notes:           '',
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        date:            existing.date,
        mood:            existing.mood,
        fatigue:         existing.fatigue,
        pain:            existing.pain,
        symptoms:        existing.symptoms as string[],
        isBreastfeeding: existing.isBreastfeeding ?? false,
        notes:           existing.notes ?? '',
      });
    }
  }, [existing]);

  function onSubmit(values: PostpartumEntryFormValues) {
    saveEntry(values, editId);
    navigation.goBack();
  }

  const symptoms   = watch('symptoms');
  const isBF       = watch('isBreastfeeding');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >

      {/* Date */}
      <Controller name="date" control={control} render={({ field }) => (
        <Input label="Date" value={field.value} onChangeText={field.onChange} placeholder="AAAA-MM-JJ" error={errors.date?.message} required />
      )} />

      {/* Humeur */}
      <View>
        <SectionLabel>Comment vous sentez-vous ?</SectionLabel>
        <Controller name="mood" control={control} render={({ field }) => (
          <ScaleRow type="mood" value={field.value} onChange={field.onChange} />
        )} />
      </View>

      {/* Fatigue */}
      <View>
        <SectionLabel>Votre niveau de fatigue</SectionLabel>
        <Controller name="fatigue" control={control} render={({ field }) => (
          <ScaleRow type="fatigue" value={field.value} onChange={field.onChange} />
        )} />
      </View>

      {/* Douleur */}
      <View>
        <SectionLabel>Niveau de douleur</SectionLabel>
        <Controller name="pain" control={control} render={({ field }) => (
          <ScaleRow type="pain" value={field.value} onChange={field.onChange} />
        )} />
      </View>

      {/* Symptômes */}
      <View>
        <SectionLabel>Symptômes présents</SectionLabel>
        <Controller name="symptoms" control={control} render={({ field }) => (
          <SymptomChips selected={field.value} onChange={field.onChange} />
        )} />
      </View>

      {/* Allaitement */}
      <TouchableOpacity
        onPress={() => setValue('isBreastfeeding', !isBF)}
        style={[bfS.toggle, isBF && bfS.toggleActive]}
        activeOpacity={0.78}
      >
        <Text style={{ fontSize: 22 }}>🤱</Text>
        <View style={{ flex: 1 }}>
          <Text style={[bfS.label, isBF && { color: colors.primary }]}>Allaitement aujourd'hui</Text>
          <Text style={bfS.sub}>{isBF ? 'Activé — vous allaitez' : 'Non renseigné'}</Text>
        </View>
        <View style={[bfS.check, isBF && bfS.checkActive]}>
          {isBF && <Text style={{ color: colors.textInverse, fontSize: 12, fontWeight: fontWeight.bold }}>✓</Text>}
        </View>
      </TouchableOpacity>

      {/* Notes */}
      <Controller name="notes" control={control} render={({ field }) => (
        <Input
          label="Notes libres"
          value={field.value ?? ''}
          onChangeText={field.onChange}
          placeholder="Comment s'est passée votre journée ?"
          multiline
          numberOfLines={4}
          inputStyle={{ height: 100, textAlignVertical: 'top', paddingTop: spacing[2] }}
          error={errors.notes?.message}
        />
      )} />

      {/* Submit */}
      <Button
        label={editId ? 'Modifier' : 'Enregistrer'}
        onPress={handleSubmit(onSubmit)}
        fullWidth size="lg"
        style={{ marginTop: spacing[4] }}
      />
      {editId && (
        <Button
          label="Supprimer"
          variant="destructive"
          onPress={() => {
            Alert.alert('Supprimer cette entrée ?', '', [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Supprimer', style: 'destructive', onPress: () => navigation.goBack() },
            ]);
          }}
          fullWidth
          style={{ marginTop: spacing[2] }}
        />
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: spacing[5], gap: spacing[5], paddingBottom: spacing[12] },
});

const bfS = StyleSheet.create({
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: colors.surfaceAlt, borderRadius: radius.xl, padding: spacing[4], borderWidth: 1.5, borderColor: colors.border },
  toggleActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  label: { fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.textPrimary },
  sub:   { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  checkActive: { backgroundColor: colors.primary, borderColor: colors.primary },
});
