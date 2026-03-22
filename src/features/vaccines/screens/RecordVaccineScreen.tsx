/**
 * features/vaccines/screens/RecordVaccineScreen.tsx
 * React Hook Form + Zod — record an administered vaccine.
 */

import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { tokens } from '@theme/tokens';
import { todayISO } from '@utils/date';
import { Input, Button } from '@components/ui';
import { useVaccineData } from '../hooks/useVaccineData';
import { recordVaccineSchema, type RecordVaccineFormValues } from '../types';
import type { PostpartumStackParams, PostpartumNavProp } from '@types/navigation';

const { colors, spacing, radius, fontSize, fontWeight } = tokens;
type Route = RouteProp<PostpartumStackParams, 'MarkVaccineDone'>;

function FormLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textPrimary, marginBottom: spacing[1] }}>
      {children}{required && <Text style={{ color: colors.primary }}> *</Text>}
    </Text>
  );
}

export function RecordVaccineScreen() {
  const navigation = useNavigation<PostpartumNavProp>();
  const route      = useRoute<Route>();
  const { recordId, babyId } = route.params;

  const { allStatuses, recordVaccine } = useVaccineData(babyId);
  const result = allStatuses.find(s => s.record?.id === recordId || s.definition.id === recordId);

  const { control, handleSubmit, formState: { errors } } = useForm<RecordVaccineFormValues>({
    resolver:      zodResolver(recordVaccineSchema),
    defaultValues: {
      administeredDate: todayISO(),
      administeredBy:   '',
      location:         '',
      batchNumber:      '',
      sideEffects:      '',
      notes:            '',
    },
  });

  function onSubmit(values: RecordVaccineFormValues) {
    if (result) {
      recordVaccine(result, values);
    }
    navigation.goBack();
    // Pop twice to go back to schedule
    if (navigation.canGoBack()) navigation.goBack();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >

        {/* Info banner */}
        {result && (
          <View style={s.banner}>
            <Text style={{ fontSize: 28 }}>💉</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.bannerName}>{result.definition.name}</Text>
              <Text style={s.bannerSub}>
                {result.definition.seriesName}
                {result.definition.numberOfDoses > 1 ? ` — dose ${result.definition.doseNumber}/${result.definition.numberOfDoses}` : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Date — required */}
        <View>
          <FormLabel required>Date d'administration</FormLabel>
          <Controller name="administeredDate" control={control} render={({ field }) => (
            <Input
              value={field.value}
              onChangeText={field.onChange}
              placeholder="AAAA-MM-JJ"
              error={errors.administeredDate?.message}
            />
          )} />
        </View>

        {/* Administré par */}
        <View>
          <FormLabel>Administré par</FormLabel>
          <Controller name="administeredBy" control={control} render={({ field }) => (
            <Input
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Dr Vidal, sage-femme…"
              error={errors.administeredBy?.message}
            />
          )} />
        </View>

        {/* Lieu */}
        <View>
          <FormLabel>Lieu</FormLabel>
          <Controller name="location" control={control} render={({ field }) => (
            <Input
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Cabinet médical, PMI…"
              error={errors.location?.message}
            />
          )} />
        </View>

        {/* Numéro de lot */}
        <View>
          <FormLabel>Numéro de lot (optionnel)</FormLabel>
          <Controller name="batchNumber" control={control} render={({ field }) => (
            <Input
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Ex : ABC123456"
              error={errors.batchNumber?.message}
            />
          )} />
        </View>

        {/* Réactions */}
        <View>
          <FormLabel>Réactions observées</FormLabel>
          <Controller name="sideEffects" control={control} render={({ field }) => (
            <Input
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Rougeur au point d'injection, légère fièvre…"
              multiline
              numberOfLines={3}
              inputStyle={{ height: 80, textAlignVertical: 'top', paddingTop: spacing[2] }}
              error={errors.sideEffects?.message}
            />
          )} />
        </View>

        {/* Notes */}
        <View>
          <FormLabel>Notes</FormLabel>
          <Controller name="notes" control={control} render={({ field }) => (
            <Input
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Autres observations…"
              multiline
              numberOfLines={3}
              inputStyle={{ height: 80, textAlignVertical: 'top', paddingTop: spacing[2] }}
              error={errors.notes?.message}
            />
          )} />
        </View>

        <Button
          label="Enregistrer le vaccin"
          onPress={handleSubmit(onSubmit)}
          fullWidth
          size="lg"
          style={{ marginTop: spacing[2] }}
        />

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignItems: 'center', paddingVertical: spacing[3] }}>
          <Text style={{ fontSize: fontSize.sm, color: colors.textTertiary }}>Annuler</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  content: { padding: spacing[5], gap: spacing[5], paddingBottom: spacing[12] },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[4],
    backgroundColor: colors.fertileLight, borderRadius: radius.xl,
    padding: spacing[4], borderWidth: 1.5, borderColor: colors.fertile + '44',
  },
  bannerName: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary },
  bannerSub:  { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
});
