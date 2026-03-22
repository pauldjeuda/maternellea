/**
 * features/profile/screens/ProfileHomeScreen.tsx
 *
 * Main profile screen.
 * Layout:
 *   - Avatar hero
 *   - Groupe Mon compte (Modifier profil, Notifications, Mon parcours)
 *   - Groupe Application (Préférences, Confidentialité, À propos)
 *   - Déconnexion
 */

import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { tokens } from '@theme/tokens';
import { useProfileData } from '../hooks/useProfileData';
import {
  AvatarBlock, SettingsGroup, SettingsRow, DangerRow, SectionLabel,
} from '../components/ProfileUI';
import { COUNTRIES, PHASE_LABELS } from '@constants';
import type { ProfileNavProp } from '@types/navigation';
import { APP_VERSION } from '../types';

const { colors, spacing } = tokens;

export function ProfileHomeScreen() {
  const navigation = useNavigation<ProfileNavProp>();
  const insets     = useSafeAreaInsets();
  const { user, logout } = useProfileData();

  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  const countryName = COUNTRIES.find(c => c.code === user.country)?.name ?? user.country;

  function confirmLogout() {
    Alert.alert(
      'Se déconnecter',
      'Vos données locales seront conservées. Vous pourrez vous reconnecter à tout moment.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text:    'Déconnexion',
          style:   'destructive',
          onPress: async () => {
            setLoggingOut(true);
            await logout();
            // Navigation resets automatically via RootNavigator
          },
        },
      ],
    );
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}
      >

        {/* ── AVATAR ─────────────────────────────────────── */}
        <AvatarBlock
          user={user}
          onEdit={() => navigation.navigate('EditProfile')}
        />

        {/* ── MON COMPTE ─────────────────────────────────── */}
        <View style={s.group}>
          <SectionLabel>Mon compte</SectionLabel>
          <SettingsGroup>
            <SettingsRow
              icon="👤" label="Modifier mon profil"
              value={user.firstName}
              onPress={() => navigation.navigate('EditProfile')}
              accent={colors.primary}
            />
            <SettingsRow
              icon="🔔" label="Notifications"
              value={user.notificationsEnabled ? 'Activées' : 'Désactivées'}
              onPress={() => navigation.navigate('NotificationPrefs')}
              accent={colors.secondary}
            />
            <SettingsRow
              icon={user.activePhase === 'cycle' ? '🌙' : user.activePhase === 'pregnancy' ? '🤰' : '👶'}
              label="Mon parcours"
              value={PHASE_LABELS[user.activePhase]}
              onPress={() => navigation.navigate('ChangePhase')}
              accent={colors.accent}
              isLast
            />
          </SettingsGroup>
        </View>

        {/* ── APPLICATION ────────────────────────────────── */}
        <View style={s.group}>
          <SectionLabel>Application</SectionLabel>
          <SettingsGroup>
            <SettingsRow
              icon="⚙️" label="Préférences"
              value={countryName}
              onPress={() => navigation.navigate('Preferences')}
              accent={colors.fertile}
            />
            <SettingsRow
              icon="🔒" label="Confidentialité"
              onPress={() => navigation.navigate('Privacy')}
              accent={colors.secondary}
            />
            <SettingsRow
              icon="ℹ️" label="À propos"
              value={`v${APP_VERSION}`}
              onPress={() => navigation.navigate('About')}
              accent={colors.textTertiary}
              isLast
            />
          </SettingsGroup>
        </View>

        {/* ── ZONE DANGER ────────────────────────────────── */}
        <View style={s.group}>
          <SectionLabel>Session</SectionLabel>
          <SettingsGroup>
            <DangerRow
              icon="🚪"
              label={loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
              onPress={confirmLogout}
              isLast
            />
          </SettingsGroup>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing[5], gap: spacing[2] },
  group:   { gap: spacing[2] },
});
