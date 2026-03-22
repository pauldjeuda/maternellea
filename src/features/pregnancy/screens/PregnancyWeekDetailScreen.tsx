/**
 * features/pregnancy/screens/PregnancyWeekDetailScreen.tsx
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { getWeeklyContent, computeProgress } from '../utils/pregnancyCalc';
import { usePregnancyData } from '../hooks/usePregnancyData';
import { WeekBadge } from '../components/PregnancyUI';
import type { PregnancyStackParams } from '@types/navigation';

const { colors, spacing, radius, fontSize, fontWeight, shadows } = tokens;
type Route = RouteProp<PregnancyStackParams, 'WeekDetail'>;

function Section({ title, text, emoji, accent }: {
  title: string; text: string; emoji: string; accent: string;
}) {
  return (
    <View style={[secS.card, { borderLeftColor: accent }]}>
      <View style={secS.header}>
        <Text style={{ fontSize: 20 }}>{emoji}</Text>
        <Text style={[secS.title, { color: accent }]}>{title}</Text>
      </View>
      <Text style={secS.text}>{text}</Text>
    </View>
  );
}

const secS = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[5],
    borderLeftWidth: 3, borderWidth: 1, borderColor: colors.borderLight, gap: spacing[3],
    ...shadows.xs,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  title:  { fontSize: fontSize.sm, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  text:   { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: fontSize.base * 1.65 },
});

export function PregnancyWeekDetailScreen() {
  const route      = useRoute<Route>();
  const navigation = useNavigation();
  const { week }   = route.params;
  const { pregnancy, progress } = usePregnancyData();

  const content      = getWeeklyContent(week);
  const isCurrentWeek = pregnancy?.currentWeek === week;
  const tc           = progress?.trimesterColor ?? colors.phasePregnancy;

  const totalWeeks = 40;
  const allWeeks   = Array.from({ length: 37 }, (_, i) => i + 4);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing[5], padding: spacing[5], paddingBottom: spacing[12] }}
      >
        {/* Hero */}
        <View style={[hs.hero, { backgroundColor: tc + '0D', borderColor: tc + '22' }]}>
          <View style={hs.left}>
            <Text style={[hs.weekNum, { color: tc }]}>{week}</Text>
            <Text style={[hs.weekLabel, { color: tc }]}>SA</Text>
            {isCurrentWeek && (
              <View style={[hs.currentBadge, { backgroundColor: tc }]}>
                <Text style={{ color: colors.textInverse, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>
                  Cette semaine
                </Text>
              </View>
            )}
          </View>
          <View style={hs.right}>
            <Text style={hs.emoji}>{content.emoji}</Text>
            <Text style={hs.size}>
              Taille d'<Text style={{ fontWeight: fontWeight.bold, color: tc }}>{content.babySize}</Text>
            </Text>
            <Text style={hs.metrics}>{content.babySizeCm} cm · {content.babyWeightGrams} g</Text>
          </View>
        </View>

        {/* Content sections */}
        <Section title="Développement de bébé" text={content.babyDevelopment} emoji="👶" accent={tc} />
        <Section title="Votre corps"           text={content.motherChanges}   emoji="🤰" accent={colors.phasePregnancy} />
        <Section title="Nutrition"             text={content.nutritionTip}    emoji="🥗" accent={colors.fertile} />

        {content.wellbeingTip && (
          <Section title="Bien-être"  text={content.wellbeingTip} emoji="🌿" accent={colors.accent} />
        )}

        {content.checkupNote && (
          <View style={[checkS.card]}>
            <Text style={{ fontSize: 18 }}>📋</Text>
            <View style={{ flex: 1 }}>
              <Text style={checkS.title}>À prévoir</Text>
              <Text style={checkS.text}>{content.checkupNote}</Text>
            </View>
          </View>
        )}

        {content.warningSign && (
          <View style={warnS.card}>
            <Text style={{ fontSize: 18 }}>⚠️</Text>
            <Text style={warnS.text}>{content.warningSign}</Text>
          </View>
        )}

        {/* Week navigator */}
        <View>
          <Text style={navS.label}>Autres semaines</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: spacing[2], paddingVertical: spacing[1] }}>
              {allWeeks.map(w => (
                <TouchableOpacity
                  key={w}
                  onPress={() => navigation.setParams({ week: w } as any)}
                  style={[
                    navS.weekBtn,
                    w === week && { backgroundColor: tc, borderColor: tc },
                  ]}
                >
                  <Text style={[
                    navS.weekBtnText,
                    w === week && { color: colors.textInverse },
                  ]}>{w}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const hs = StyleSheet.create({
  hero:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: radius['2xl'], padding: spacing[6], borderWidth: 1.5 },
  left:       { alignItems: 'center', gap: spacing[1] },
  weekNum:    { fontSize: fontSize['5xl'], fontWeight: fontWeight.extraBold, letterSpacing: -3 },
  weekLabel:  { fontSize: fontSize.lg, fontWeight: fontWeight.semiBold },
  currentBadge: { borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: spacing[1], marginTop: spacing[2] },
  right:      { alignItems: 'center', gap: spacing[2] },
  emoji:      { fontSize: 52 },
  size:       { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', maxWidth: 160 },
  metrics:    { fontSize: fontSize.xs, color: colors.textTertiary },
});

const checkS = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing[3], alignItems: 'flex-start', backgroundColor: colors.infoLight, borderRadius: radius.xl, padding: spacing[4], borderWidth: 1, borderColor: colors.info + '33' },
  title: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.info, marginBottom: spacing[1] },
  text:  { fontSize: fontSize.sm, color: colors.textSecondary },
});

const warnS = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing[3], alignItems: 'flex-start', backgroundColor: colors.warningLight, borderRadius: radius.xl, padding: spacing[4], borderWidth: 1, borderColor: colors.warning + '44' },
  text: { flex: 1, fontSize: fontSize.sm, color: colors.warningText, lineHeight: fontSize.sm * 1.6 },
});

const navS = StyleSheet.create({
  label:       { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textTertiary, marginBottom: spacing[2] },
  weekBtn: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceAlt,
  },
  weekBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textSecondary },
});
