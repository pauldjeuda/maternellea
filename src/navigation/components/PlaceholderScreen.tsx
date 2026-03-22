/**
 * navigation/components/PlaceholderScreen.tsx
 *
 * Clean placeholder for screens not yet implemented.
 * Shows the screen name, a status badge, and a back button when applicable.
 * Replace with the real screen implementation without changing the stack.
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '@theme/tokens';

const { colors, spacing, radius, fontSize, fontWeight, shadows } = tokens;

interface PlaceholderScreenProps {
  title:    string;
  icon?:    string;
  subtitle?: string;
}

export function PlaceholderScreen({
  title,
  icon    = '🚧',
  subtitle = 'Cet écran sera disponible prochainement.',
}: PlaceholderScreenProps) {
  const navigation = useNavigation();
  const insets     = useSafeAreaInsets();
  const canGoBack  = navigation.canGoBack();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[4] },
      ]}
    >
      {canGoBack && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>Retour</Text>
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>En développement</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing[6],
  },
  backBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing[1],
    marginBottom:   spacing[4],
    alignSelf:      'flex-start',
    padding:        spacing[1],
  },
  backIcon: {
    fontSize:  20,
    color:     colors.textSecondary,
  },
  backLabel: {
    fontSize:   fontSize.sm,
    color:      colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  content: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing[4],
  },
  iconContainer: {
    width:           88,
    height:          88,
    borderRadius:    radius['2xl'],
    backgroundColor: colors.primaryLight,
    alignItems:      'center',
    justifyContent:  'center',
    ...shadows.coloredSm,
  },
  icon: {
    fontSize: 42,
  },
  title: {
    fontSize:    fontSize['2xl'],
    fontWeight:  fontWeight.bold,
    color:       colors.textPrimary,
    textAlign:   'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize:  fontSize.base,
    color:     colors.textSecondary,
    textAlign: 'center',
    maxWidth:  280,
    lineHeight: fontSize.base * 1.6,
  },
  badge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing[2],
    backgroundColor: colors.warningLight,
    borderRadius:    radius.full,
    paddingVertical:   spacing[1.5],
    paddingHorizontal: spacing[3],
    marginTop:       spacing[2],
  },
  badgeDot: {
    width:           7,
    height:          7,
    borderRadius:    radius.full,
    backgroundColor: colors.warning,
  },
  badgeText: {
    fontSize:   fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color:      colors.warningText,
  },
});
