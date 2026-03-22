/**
 * features/home/components/PostpartumDashboard.tsx
 *
 * Home dashboard — profil Post-partum.
 *
 * Sections:
 *   1. Hero card : résumé bébé (nom, âge, photo avatar)
 *   2. Stats croissance : poids · taille · dernière mesure
 *   3. Prochain vaccin (avec badge statut)
 *   4. Rappel mère : dernier mood enregistré
 *   5. Actions rapides : Carnet / Croissance / Vaccins / Mon état
 *   6. Conseil du jour
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { GENDER_EMOJIS, VACCINE_STATUS_LABELS, MOOD_EMOJIS, MOOD_LABELS } from '@constants';

import {
  HeroCard, SurfaceCard, StatRow, StatPill, QuickActionsRow, QuickAction,
  TipCard, SectionTitle, InfoRow, VaccineBadge, MoodDot,
} from './DashboardCards';
import type { PostpartumHomeData } from '../hooks/useHomeData';
import { fmtShort, dayLabel, daysUntil } from '@utils/date';

const { colors, spacing, radius, fontSize, fontWeight } = tokens;

interface Props { data: PostpartumHomeData; }

export function PostpartumDashboard({ data }: Props) {
  const { baby, babyAge, latestGrowth, nextVaccine, recentMood, tipArticle } = data;
  const navigation = useNavigation();

  if (!baby) {
    return (
      <SurfaceCard>
        <Text style={{ textAlign: 'center', color: colors.textSecondary, fontSize: fontSize.base }}>
          Ajoutez le profil de votre bébé dans l'onglet Suivi.
        </Text>
      </SurfaceCard>
    );
  }

  const genderEmoji = GENDER_EMOJIS[baby.gender] ?? '🍼';

  return (
    <View style={styles.root}>

      {/* ── 1. HERO : Résumé bébé ─────────────────────────── */}
      <HeroCard
        label="Votre bébé"
        metric={babyAge?.shortLabel ?? '—'}
        emoji={genderEmoji}
        accent={colors.phasePostpartum}
        bg={colors.accentSubtle}
        style={styles.heroCard}
      >
        <View style={styles.babyMeta}>
          <View style={[styles.babynameWrap, { backgroundColor: colors.phasePostpartum + '1A' }]}>
            <Text style={[styles.babyname, { color: colors.phasePostpartum }]}>{baby.name}</Text>
          </View>
          {babyAge && (
            <Text style={styles.babyAgeDetail}>{babyAge.label}</Text>
          )}
        </View>
        {baby.birthDate && (
          <Text style={styles.birthDate}>
            Née le {fmtShort(baby.birthDate)}
            {baby.birthWeightGrams && ` · ${(baby.birthWeightGrams / 1000).toFixed(2)} kg`}
          </Text>
        )}
      </HeroCard>

      {/* ── 2. STATS CROISSANCE ───────────────────────────── */}
      {latestGrowth && (
        <View>
          <SectionTitle
            title="Dernière mesure"
            actionLabel="Courbes"
            onAction={() => navigation.navigate('GrowthTracking' as never, { babyId: baby.id } as never)}
            style={styles.sectionTitle}
          />
          <StatRow>
            <StatPill
              icon="⚖️" label="Poids"
              value={latestGrowth.weightGrams < 1000
                ? `${latestGrowth.weightGrams} g`
                : `${(latestGrowth.weightGrams / 1000).toFixed(1).replace('.', ',')} kg`}
              accent={colors.phasePostpartum}
            />
            <StatPill
              icon="📏" label="Taille"
              value={`${latestGrowth.heightCm} cm`}
              accent={colors.secondary}
            />
            {latestGrowth.headCircumferenceCm && (
              <StatPill
                icon="🫧" label="Périmètre"
                value={`${latestGrowth.headCircumferenceCm} cm`}
                accent={colors.fertile}
              />
            )}
          </StatRow>
          <Text style={styles.growthDate}>
            Mesurée {dayLabel(latestGrowth.date)}
            {latestGrowth.measuredBy ? ` par ${latestGrowth.measuredBy}` : ''}
          </Text>
        </View>
      )}

      {/* ── 3. PROCHAIN VACCIN ────────────────────────────── */}
      {nextVaccine && (
        <View>
          <SectionTitle
            title="Carnet vaccinal"
            actionLabel="Tout voir"
            onAction={() => navigation.navigate('VaccineCalendar' as never, { babyId: baby.id } as never)}
            style={styles.sectionTitle}
          />
          <SurfaceCard
            onPress={() => navigation.navigate('VaccineDetail' as never, { recordId: nextVaccine.id, babyId: baby.id } as never)}
            outlined
            style={nextVaccine.status === 'due_soon' ? { borderColor: colors.warning + '55' } :
                   nextVaccine.status === 'overdue'  ? { borderColor: colors.error + '55' } : {}}
          >
            <InfoRow
              icon="💉"
              title={nextVaccine.vaccine.name}
              subtitle={[
                nextVaccine.vaccine.recommendedAgeLabel,
                nextVaccine.scheduledDate ? `Prévu le ${fmtShort(nextVaccine.scheduledDate)}` : undefined,
              ].filter(Boolean).join(' · ')}
              accent={nextVaccine.status === 'due_soon' ? colors.warning :
                      nextVaccine.status === 'overdue'  ? colors.error   : colors.phasePostpartum}
              right={<VaccineBadge status={nextVaccine.status} />}
            />
            {nextVaccine.scheduledDate && (
              <View style={styles.vaccineDaysWrap}>
                <Text style={[
                  styles.vaccineDays,
                  { color: nextVaccine.status === 'overdue' ? colors.error :
                            nextVaccine.status === 'due_soon' ? colors.warning : colors.textTertiary },
                ]}>
                  {nextVaccine.status === 'overdue'
                    ? `En retard de ${Math.abs(daysUntil(nextVaccine.scheduledDate))} j`
                    : `Dans ${daysUntil(nextVaccine.scheduledDate)} j`}
                </Text>
              </View>
            )}
            <Text style={styles.vaccineDiseases} numberOfLines={1}>
              Protège contre : {nextVaccine.vaccine.diseases.slice(0, 3).join(', ')}
              {nextVaccine.vaccine.diseases.length > 3 ? '…' : ''}
            </Text>
          </SurfaceCard>
        </View>
      )}

      {/* ── 4. MON ÉTAT DU JOUR ───────────────────────────── */}
      <View>
        <SectionTitle
          title="Mon état"
          actionLabel="Historique"
          onAction={() => navigation.navigate('PostpartumJournal' as never)}
          style={styles.sectionTitle}
        />
        {recentMood ? (
          <SurfaceCard
            onPress={() => navigation.navigate('AddPostpartumEntry' as never)}
          >
            <View style={styles.moodRow}>
              <MoodDot level={recentMood.mood} size={44} />
              <View style={styles.moodText}>
                <Text style={styles.moodLabel}>
                  {MOOD_LABELS[recentMood.mood]} — {MOOD_EMOJIS[recentMood.mood]}
                </Text>
                <Text style={styles.moodDate}>{dayLabel(recentMood.date)}</Text>
                {recentMood.notes && (
                  <Text style={styles.moodNote} numberOfLines={2}>{recentMood.notes}</Text>
                )}
              </View>
              <Text style={styles.moodEdit}>✏️</Text>
            </View>
          </SurfaceCard>
        ) : (
          <SurfaceCard
            tint={colors.primarySubtle}
            onPress={() => navigation.navigate('AddPostpartumEntry' as never)}
          >
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, textAlign: 'center' }}>
              Comment vous sentez-vous aujourd'hui ? Tapez pour noter votre état.
            </Text>
          </SurfaceCard>
        )}
      </View>

      {/* ── 5. ACTIONS RAPIDES ────────────────────────────── */}
      <QuickActionsRow>
        <QuickAction
          emoji="📒" label="Carnet"
          accent={colors.phasePostpartum}
          onPress={() => navigation.navigate('BabyDashboard' as never, { babyId: baby.id } as never)}
        />
        <QuickAction
          emoji="📈" label="Croissance"
          accent={colors.secondary}
          onPress={() => navigation.navigate('GrowthTracking' as never, { babyId: baby.id } as never)}
        />
        <QuickAction
          emoji="💉" label="Vaccins"
          accent={colors.fertile}
          onPress={() => navigation.navigate('VaccineCalendar' as never, { babyId: baby.id } as never)}
        />
        <QuickAction
          emoji="💬" label="Mon état"
          accent={colors.accent}
          onPress={() => navigation.navigate('AddPostpartumEntry' as never)}
        />
      </QuickActionsRow>

      {/* ── 6. CONSEIL DU JOUR ────────────────────────────── */}
      <TipCard
        label="Post-partum"
        title={tipArticle.title}
        summary={tipArticle.summary}
        readMin={tipArticle.readTimeMinutes}
        accent={colors.phasePostpartum}
        onPress={() => navigation.navigate('AdviceDetail' as never, { articleId: tipArticle.id } as never)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  root:      { gap: spacing[4] },
  heroCard:  {},
  babyMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginTop: spacing[3] },
  babynameWrap: { borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: spacing[1] },
  babyname: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  babyAgeDetail: { fontSize: fontSize.sm, color: colors.textSecondary },
  birthDate: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing[2] },
  sectionTitle: { marginBottom: spacing[2] },
  growthDate: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing[2], textAlign: 'center' },
  vaccineDaysWrap: { marginTop: spacing[3], paddingLeft: spacing[1] },
  vaccineDays: { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },
  vaccineDiseases: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing[1], paddingLeft: spacing[1] },
  moodRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  moodText:  { flex: 1, gap: spacing[0.5] },
  moodLabel: { fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.textPrimary },
  moodDate:  { fontSize: fontSize.xs, color: colors.textTertiary },
  moodNote:  { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing[1] },
  moodEdit:  { fontSize: 18 },
});
