/**
 * features/vaccines/screens/UpcomingVaccinesScreen.tsx
 * Shows only pending/upcoming vaccines, sorted by urgency.
 * Can be used as a standalone screen or embedded widget.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { fmtShort } from '@utils/date';
import { useVaccineData } from '../hooks/useVaccineData';
import { VaccineCard, SectionHeader, EmptyCard } from '../components/VaccineUI';
import { daysLabel } from '../utils/vaccineCalc';
import type { PostpartumStackParams, PostpartumNavProp } from '@types/navigation';

const { colors, spacing, radius, fontSize, fontWeight, shadows } = tokens;
type Route = RouteProp<PostpartumStackParams, 'VaccineCalendar'>;

export function UpcomingVaccinesScreen() {
  const navigation = useNavigation<PostpartumNavProp>();
  const route      = useRoute<Route>();
  const babyId     = route.params?.babyId;
  const { upcoming, baby } = useVaccineData(babyId);

  const overdue  = upcoming.filter(r => r.isOverdue);
  const dueSoon  = upcoming.filter(r => r.isDueSoon);
  const futureUp = upcoming.filter(r => r.status === 'upcoming');

  function goToDetail(recordId: string) {
    navigation.navigate('VaccineDetail', {
      recordId,
      babyId: babyId ?? baby?.id ?? '',
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >

        {/* Overdue section */}
        {overdue.length > 0 && (
          <View>
            <View style={s.urgentBanner}>
              <Text style={{ fontSize: 20 }}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.urgentTitle}>En retard</Text>
                <Text style={s.urgentSub}>
                  {overdue.length} vaccin{overdue.length > 1 ? 's' : ''} dépassé{overdue.length > 1 ? 's' : ''} — consultez votre pédiatre.
                </Text>
              </View>
            </View>
            <View style={{ gap: spacing[3] }}>
              {overdue.map(r => (
                <VaccineCard
                  key={r.definition.id}
                  result={r}
                  onPress={() => goToDetail(r.record?.id ?? r.definition.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Due soon section */}
        {dueSoon.length > 0 && (
          <View>
            <SectionHeader
              title="À faire bientôt"
              style={{ marginBottom: spacing[3] }}
            />
            <View style={{ gap: spacing[3] }}>
              {dueSoon.map(r => (
                <VaccineCard
                  key={r.definition.id}
                  result={r}
                  onPress={() => goToDetail(r.record?.id ?? r.definition.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Upcoming section */}
        {futureUp.length > 0 && (
          <View>
            <SectionHeader
              title="À venir"
              style={{ marginBottom: spacing[3] }}
            />
            <View style={{ gap: spacing[3] }}>
              {futureUp.map(r => (
                <VaccineCard
                  key={r.definition.id}
                  result={r}
                  compact
                  onPress={() => goToDetail(r.record?.id ?? r.definition.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Empty */}
        {upcoming.length === 0 && (
          <EmptyCard
            emoji="🎉"
            title="Tout est à jour !"
            subtitle="Tous les vaccins prévus ont été administrés. Consultez l'historique pour les détails."
          />
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  content:     { padding: spacing[5], gap: spacing[6], paddingBottom: spacing[12] },
  urgentBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3],
    backgroundColor: colors.errorLight, borderRadius: radius.xl,
    padding: spacing[4], borderWidth: 1.5, borderColor: colors.error + '44',
    marginBottom: spacing[3],
  },
  urgentTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.errorText },
  urgentSub:   { fontSize: fontSize.sm, color: colors.errorText, marginTop: 2, lineHeight: fontSize.sm * 1.5 },
});
