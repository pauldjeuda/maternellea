/**
 * features/profile/screens/PrivacyScreen.tsx + AboutScreen.tsx
 *
 * Two simple screens:
 *  PrivacyScreen — données collectées, droits utilisateur, contacts
 *  AboutScreen   — version, équipe, liens légaux
 *
 * Both exported from this single file for brevity.
 */

import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokens } from '@theme/tokens';
import { SettingsGroup, InfoRow, SettingsRow, SectionLabel } from '../components/ProfileUI';
import { APP_VERSION, BUILD_NUMBER } from '../types';

const { colors, spacing, radius, fontSize, fontWeight } = tokens;

// ─────────────────────────────────────────────────────────────
//  PRIVACY SCREEN
// ─────────────────────────────────────────────────────────────

export function PrivacyScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >

      {/* Intro */}
      <View style={s.intro}>
        <Text style={{ fontSize: 36, textAlign: 'center' }}>🔒</Text>
        <Text style={s.introTitle}>Votre vie privée compte</Text>
        <Text style={s.introText}>
          Maternellea a été conçue avec la vie privée au cœur de chaque décision.
          Vos données de santé sont sensibles — nous les traitons avec le plus grand soin.
        </Text>
      </View>

      {/* Données collectées */}
      <View style={s.group}>
        <SectionLabel>Données collectées</SectionLabel>
        <View style={s.textCard}>
          {[
            { icon: '👤', text: 'Prénom et date de naissance (optionnel)' },
            { icon: '📧', text: 'Adresse email (pour la connexion)' },
            { icon: '🌙', text: 'Données de cycle menstruel que vous saisissez' },
            { icon: '🤰', text: 'Données de grossesse que vous renseignez' },
            { icon: '👶', text: 'Données bébé saisies dans le carnet de santé' },
          ].map(item => (
            <View key={item.text} style={s.dataItem}>
              <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              <Text style={s.dataText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stockage */}
      <View style={s.group}>
        <SectionLabel>Où sont vos données ?</SectionLabel>
        <SettingsGroup>
          <View style={[s.dataItem, { padding: spacing[4] }]}>
            <Text style={{ fontSize: 18 }}>📱</Text>
            <Text style={s.dataText}>
              Toutes vos données sont stockées localement sur votre appareil.
              Aucune donnée de santé n'est transmise à nos serveurs sans votre consentement explicite.
            </Text>
          </View>
        </SettingsGroup>
      </View>

      {/* Droits */}
      <View style={s.group}>
        <SectionLabel>Vos droits (RGPD)</SectionLabel>
        <SettingsGroup>
          <InfoRow label="Accès" value="À tout moment" />
          <InfoRow label="Rectification" value="Via Modifier profil" />
          <InfoRow label="Suppression" value="Supprimez l'app" />
          <InfoRow label="Portabilité" value="Bientôt disponible" isLast />
        </SettingsGroup>
      </View>

      {/* Contact */}
      <View style={s.group}>
        <SectionLabel>Contact</SectionLabel>
        <SettingsGroup>
          <TouchableOpacity
            style={s.linkRow}
            onPress={() => Linking.openURL('mailto:privacy@maternellea.com')}
          >
            <Text style={{ fontSize: 18 }}>📧</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.linkTitle}>Délégué à la protection des données</Text>
              <Text style={s.linkUrl}>privacy@maternellea.com</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.linkRow, { borderTopWidth: 1, borderTopColor: colors.borderLight }]}
            onPress={() => Linking.openURL('https://maternellea.com/privacy')}
          >
            <Text style={{ fontSize: 18 }}>🌐</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.linkTitle}>Politique de confidentialité complète</Text>
              <Text style={s.linkUrl}>maternellea.com/privacy</Text>
            </View>
            <Text style={{ fontSize: 18, color: colors.textTertiary }}>›</Text>
          </TouchableOpacity>
        </SettingsGroup>
      </View>

    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
//  ABOUT SCREEN
// ─────────────────────────────────────────────────────────────

export function AboutScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >

      {/* Logo / brand */}
      <View style={s.brand}>
        <View style={s.brandIcon}>
          <Text style={{ fontSize: 44 }}>🌸</Text>
        </View>
        <Text style={s.brandName}>Maternellea</Text>
        <Text style={s.brandTagline}>Votre compagnon de santé féminine</Text>
      </View>

      {/* Version */}
      <View style={s.group}>
        <SectionLabel>Version</SectionLabel>
        <SettingsGroup>
          <InfoRow label="Version"       value={APP_VERSION} />
          <InfoRow label="Build"         value={BUILD_NUMBER} />
          <InfoRow label="Plateforme"    value="React Native" />
          <InfoRow label="Dernière MAJ"  value="Mars 2026" isLast />
        </SettingsGroup>
      </View>

      {/* Légal */}
      <View style={s.group}>
        <SectionLabel>Légal</SectionLabel>
        <SettingsGroup>
          {[
            { icon: '📄', label: "Conditions d'utilisation",  url: 'https://maternellea.com/terms' },
            { icon: '🔒', label: 'Politique de confidentialité', url: 'https://maternellea.com/privacy' },
            { icon: '🍪', label: 'Gestion des cookies',       url: 'https://maternellea.com/cookies' },
          ].map((item, idx, arr) => (
            <TouchableOpacity
              key={item.label}
              style={[s.linkRow, idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              onPress={() => Linking.openURL(item.url)}
            >
              <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              <Text style={[s.linkTitle, { flex: 1 }]}>{item.label}</Text>
              <Text style={{ fontSize: 18, color: colors.textTertiary }}>›</Text>
            </TouchableOpacity>
          ))}
        </SettingsGroup>
      </View>

      {/* Team */}
      <View style={s.group}>
        <SectionLabel>L'équipe</SectionLabel>
        <View style={s.textCard}>
          <Text style={s.dataText}>
            Maternellea est développée avec ❤️ par une équipe dédiée à améliorer
            la santé reproductive et le bien-être des femmes francophones dans le monde.
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://maternellea.com/about')}>
            <Text style={[s.linkUrl, { marginTop: spacing[3] }]}>En savoir plus →</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={s.copyright}>© 2026 Maternellea · Tous droits réservés</Text>

    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
//  SHARED STYLES
// ─────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  content:  { padding: spacing[5], gap: spacing[5], paddingBottom: spacing[12] },
  group:    { gap: spacing[2] },

  intro:     { alignItems: 'center', gap: spacing[3], paddingVertical: spacing[4] },
  introTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, textAlign: 'center' },
  introText:  { fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', lineHeight: fontSize.base * 1.65 },

  textCard:  { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[5], gap: spacing[3], borderWidth: 1, borderColor: colors.borderLight },
  dataItem:  { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  dataText:  { flex: 1, fontSize: fontSize.base, color: colors.textSecondary, lineHeight: fontSize.base * 1.6 },

  linkRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[4] },
  linkTitle: { fontSize: fontSize.base, color: colors.textPrimary, fontWeight: fontWeight.medium },
  linkUrl:   { fontSize: fontSize.sm, color: colors.primary },

  brand:       { alignItems: 'center', gap: spacing[2], paddingVertical: spacing[4] },
  brandIcon:   { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  brandName:   { fontSize: fontSize['2xl'], fontWeight: fontWeight.extraBold, color: colors.textPrimary, letterSpacing: -0.5 },
  brandTagline: { fontSize: fontSize.sm, color: colors.textTertiary },

  copyright:  { fontSize: fontSize.xs, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing[2] },
});
