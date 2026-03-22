/**
 * features/home/screens/HomeScreen.tsx
 *
 * Root screen for the HomeTab.
 * Acts as a DashboardRouter: reads active phase and renders
 * the appropriate dashboard variant inside a shared scroll shell.
 *
 * Shell responsibilities:
 *   - Safe-area top padding
 *   - Pull-to-refresh
 *   - Greeting header
 *   - Phase pill (tappable → ChangePhase)
 *   - Conditional scroll fade at top
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  View, ScrollView, RefreshControl, Animated,
  TouchableOpacity, Text, StyleSheet, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { PHASE_LABELS, PHASE_EMOJIS } from '@constants';
import { useAuthStore, selectUser } from '@store/authStore';

import { GreetingHeader } from '../components/DashboardCards';
import { CycleDashboard }     from '../components/CycleDashboard';
import { PregnancyDashboard } from '../components/PregnancyDashboard';
import { PostpartumDashboard } from '../components/PostpartumDashboard';
import { useHomeData, type HomeData } from '../hooks/useHomeData';

const { colors, spacing, radius, fontSize, fontWeight, shadows } = tokens;

// ─────────────────────────────────────────────────────────────
//  PHASE PILL  (shows active phase, navigates to ChangePhase)
// ─────────────────────────────────────────────────────────────

const PHASE_PILL_COLORS = {
  cycle:      { bg: colors.primaryLight,  text: colors.phaseCycle      },
  pregnancy:  { bg: colors.secondaryLight, text: colors.phasePregnancy  },
  postpartum: { bg: colors.accentLight,   text: colors.phasePostpartum  },
};

function PhasePill({ phase }: { phase: 'cycle' | 'pregnancy' | 'postpartum' }) {
  const navigation = useNavigation();
  const c = PHASE_PILL_COLORS[phase];

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('ChangePhase' as never)}
      activeOpacity={0.75}
      style={[pillS.wrap, { backgroundColor: c.bg }]}
    >
      <Text style={pillS.emoji}>{PHASE_EMOJIS[phase]}</Text>
      <Text style={[pillS.label, { color: c.text }]}>{PHASE_LABELS[phase]}</Text>
      <Text style={[pillS.chevron, { color: c.text }]}>›</Text>
    </TouchableOpacity>
  );
}

const pillS = StyleSheet.create({
  wrap:    { flexDirection: 'row', alignItems: 'center', gap: spacing[1.5], alignSelf: 'flex-start', borderRadius: radius.full, paddingVertical: spacing[1], paddingHorizontal: spacing[3] },
  emoji:   { fontSize: 14 },
  label:   { fontSize: fontSize.xs, fontWeight: fontWeight.semiBold },
  chevron: { fontSize: 14, fontWeight: fontWeight.bold, marginTop: 1 },
});

// ─────────────────────────────────────────────────────────────
//  DASHBOARD ROUTER
// ─────────────────────────────────────────────────────────────

function DashboardRouter({ data }: { data: HomeData }) {
  switch (data.phase) {
    case 'cycle':      return <CycleDashboard     data={data} />;
    case 'pregnancy':  return <PregnancyDashboard  data={data} />;
    case 'postpartum': return <PostpartumDashboard data={data} />;
  }
}

// ─────────────────────────────────────────────────────────────
//  HOME SCREEN
// ─────────────────────────────────────────────────────────────

export function HomeScreen() {
  const insets     = useSafeAreaInsets();
  const user       = useAuthStore(selectUser);
  const data       = useHomeData();
  const [refreshing, setRefreshing] = useState(false);

  const scrollY    = useRef(new Animated.Value(0)).current;

  // Header shadow on scroll
  const headerElevation = scrollY.interpolate({
    inputRange: [0, 24],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, 24],
    outputRange: [0, 0.08],
    extrapolate: 'clamp',
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // In prod: refetch from API. For now, just pause.
    await new Promise(r => setTimeout(r, 900));
    setRefreshing(false);
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Sticky header ─────────────────────────────────── */}
      <Animated.View
        style={[
          styles.header,
          {
            elevation:        headerElevation,
            shadowOpacity:    headerShadowOpacity,
            shadowColor:      '#000',
            shadowOffset:     { width: 0, height: 2 },
            shadowRadius:     6,
          },
        ]}
      >
        <GreetingHeader name={user?.firstName ?? 'vous'} />
        <View style={styles.headerBottom}>
          <PhasePill phase={data.phase} />
          <Text style={styles.todayDate}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
          </Text>
        </View>
      </Animated.View>

      {/* ── Scrollable content ────────────────────────────── */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <DashboardRouter data={data} />
      </Animated.ScrollView>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor:   colors.background,
    paddingHorizontal: spacing[5],
    paddingTop:        spacing[3],
    paddingBottom:     spacing[4],
    gap:               spacing[3],
  },
  headerBottom: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  todayDate: {
    fontSize:   fontSize.xs,
    color:      colors.textTertiary,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingTop:        spacing[2],
    paddingBottom:     spacing[12],
    gap:               spacing[4],
  },
});
