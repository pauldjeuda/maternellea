/**
 * features/profile/screens/ChangeJourneyScreen.tsx
 *
 * Changer le parcours principal (cycle → grossesse → post-partum).
 * Affiche les 3 options avec description, couleur, et confirmation.
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokens } from '@theme/tokens';
import { Button } from '@components/ui';
import { useProfileData } from '../hooks/useProfileData';
import { JOURNEY_OPTIONS } from '../types';
import type { UserPhase } from '@types/models';

const { colors, spacing, radius, fontSize, fontWeight, shadows } = tokens;

export function ChangeJourneyScreen() {
  const navigation = useNavigation();
  const insets     = useSafeAreaInsets();
  const { user, changePhase } = useProfileData();

  const [selected, setSelected] = useState<UserPhase>(
    user?.activePhase ?? 'cycle',
  );

  const isDirty  = selected !== user?.activePhase;
  const selOpt   = JOURNEY_OPTIONS.find(o => o.phase === selected)!;

  function confirm() {
    if (!isDirty) { navigation.goBack(); return; }

    Alert.alert(
      'Changer de parcours ?',
      `Vous passez en mode "${selOpt.label}". Vos données existantes sont conservées.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            changePhase(selected);
            navigation.goBack();
          },
        },
      ],
    );
  }

  return (
    <View style={[s.root, { paddingBottom: insets.bottom + spacing[4] }]}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── INTRO ─────────────────────────────────────── */}
        <View style={s.intro}>
          <Text style={s.introTitle}>Quel est votre parcours ?</Text>
          <Text style={s.introSub}>
            L'application adapte son suivi, ses conseils et son calendrier
            selon votre situation actuelle.
          </Text>
        </View>

        {/* ── OPTIONS ───────────────────────────────────── */}
        <View style={s.options}>
          {JOURNEY_OPTIONS.map(opt => {
            const isActive  = opt.phase === user?.activePhase;
            const isSel     = opt.phase === selected;

            return (
              <TouchableOpacity
                key={opt.phase}
                onPress={() => setSelected(opt.phase)}
                activeOpacity={0.84}
                style={[
                  s.card,
                  { borderColor: isSel ? opt.color : colors.border },
                  isSel && { backgroundColor: opt.bgColor, ...shadows.sm },
                ]}
              >
                {/* Selection ring */}
                <View style={[s.radio, { borderColor: isSel ? opt.color : colors.border }]}>
                  {isSel && (
                    <View style={[s.radioDot, { backgroundColor: opt.color }]} />
                  )}
                </View>

                <View style={[s.cardIcon, { backgroundColor: opt.color + '22' }]}>
                  <Text style={{ fontSize: 28 }}>{opt.emoji}</Text>
                </View>

                <View style={{ flex: 1, gap: spacing[1] }}>
                  <View style={s.cardTitleRow}>
                    <Text style={[s.cardTitle, isSel && { color: opt.color }]}>
                      {opt.label}
                    </Text>
                    {isActive && (
                      <View style={[s.activeBadge, { backgroundColor: opt.color + '18', borderColor: opt.color + '44' }]}>
                        <Text style={[s.activeBadgeText, { color: opt.color }]}>Actuel</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.cardDesc}>{opt.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* ── FOOTER CTA ────────────────────────────────────── */}
      <View style={[s.footer, { backgroundColor: colors.background }]}>
        <Button
          label={isDirty ? `Passer en "${selOpt.label}"` : 'Parcours inchangé'}
          onPress={confirm}
          disabled={!isDirty}
          fullWidth
          size="lg"
        />
        <Button
          label="Annuler"
          variant="ghost"
          onPress={() => navigation.goBack()}
          fullWidth
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing[5], gap: spacing[5], paddingBottom: spacing[4] },

  intro: { gap: spacing[2] },
  introTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, letterSpacing: -0.3 },
  introSub:   { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: fontSize.base * 1.6 },

  options:   { gap: spacing[3] },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[4],
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing[5], borderWidth: 2,
    ...shadows.xs,
  },
  radio:     { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioDot:  { width: 10, height: 10, borderRadius: 5 },
  cardIcon:  { width: 54, height: 54, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  cardDesc:  { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: fontSize.sm * 1.5 },
  activeBadge: { borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: 2, borderWidth: 1 },
  activeBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },

  footer: { paddingHorizontal: spacing[5], paddingTop: spacing[3], gap: spacing[2] },
});
