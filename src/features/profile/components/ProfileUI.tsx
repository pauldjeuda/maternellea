/**
 * features/profile/components/ProfileUI.tsx
 *
 * Shared UI primitives for the profile module.
 *
 * Exports:
 *   SettingsRow       — tappable row with icon, label, value + chevron
 *   SettingsGroup     — card wrapper for a group of rows
 *   ToggleRow         — row with a native-style toggle switch
 *   SectionLabel      — uppercase section heading
 *   AvatarBlock       — avatar + name + email + phase badge
 *   FormField         — labeled form field wrapper
 *   SegmentControl    — 2–4 option pill selector (for theme / units)
 *   DangerRow         — red destructive action row
 *   InfoRow           — static info display row (key + value)
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, Switch, StyleSheet, ViewStyle,
} from 'react-native';

import { tokens } from '@theme/tokens';
import { PHASE_EMOJIS, PHASE_LABELS } from '@constants';
import type { UserProfile, UserPhase } from '@types/models';

const { colors, spacing, radius, fontSize, fontWeight, shadows, palette } = tokens;

// ─────────────────────────────────────────────────────────────
//  SECTION LABEL
// ─────────────────────────────────────────────────────────────

export function SectionLabel({ children, style }: { children: string; style?: ViewStyle }) {
  return (
    <Text style={[slS.label, style]}>{children.toUpperCase()}</Text>
  );
}

const slS = StyleSheet.create({
  label: {
    fontSize:      fontSize.xs,
    fontWeight:    fontWeight.semiBold,
    color:         colors.textTertiary,
    letterSpacing: 0.8,
    paddingHorizontal: spacing[1],
    marginBottom:  spacing[1],
  },
});

// ─────────────────────────────────────────────────────────────
//  SETTINGS GROUP  (card wrapper)
// ─────────────────────────────────────────────────────────────

export function SettingsGroup({
  children, style,
}: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[sgS.card, style]}>{children}</View>
  );
}

const sgS = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius:    radius.xl,
    borderWidth:     1,
    borderColor:     colors.borderLight,
    overflow:        'hidden',
    ...shadows.xs,
  },
});

// ─────────────────────────────────────────────────────────────
//  SETTINGS ROW  (tappable → chevron)
// ─────────────────────────────────────────────────────────────

interface SettingsRowProps {
  icon:      string;
  label:     string;
  value?:    string;
  onPress:   () => void;
  isLast?:   boolean;
  accent?:   string;
  style?:    ViewStyle;
}

export function SettingsRow({
  icon, label, value, onPress, isLast, accent, style,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      style={[srS.row, !isLast && srS.bordered, style]}
    >
      <View style={[srS.iconWrap, { backgroundColor: (accent ?? colors.primary) + '18' }]}>
        <Text style={srS.icon}>{icon}</Text>
      </View>
      <Text style={srS.label}>{label}</Text>
      <View style={srS.right}>
        {value && <Text style={srS.value} numberOfLines={1}>{value}</Text>}
        <Text style={srS.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const srS = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[4], paddingHorizontal: spacing[4] },
  bordered: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  iconWrap: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  icon:     { fontSize: 18 },
  label:    { flex: 1, fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.textPrimary },
  right:    { flexDirection: 'row', alignItems: 'center', gap: spacing[1.5] },
  value:    { fontSize: fontSize.sm, color: colors.textTertiary, maxWidth: 140 },
  chevron:  { fontSize: 20, color: colors.textTertiary, fontWeight: fontWeight.bold },
});

// ─────────────────────────────────────────────────────────────
//  TOGGLE ROW
// ─────────────────────────────────────────────────────────────

interface ToggleRowProps {
  icon:        string;
  label:       string;
  subtitle?:   string;
  value:       boolean;
  onToggle:    (v: boolean) => void;
  isLast?:     boolean;
  disabled?:   boolean;
  accent?:     string;
}

export function ToggleRow({
  icon, label, subtitle, value, onToggle, isLast, disabled, accent,
}: ToggleRowProps) {
  const tint = accent ?? colors.primary;
  return (
    <View style={[trS.row, !isLast && trS.bordered, disabled && { opacity: 0.5 }]}>
      <View style={[trS.iconWrap, { backgroundColor: tint + '18' }]}>
        <Text style={trS.icon}>{icon}</Text>
      </View>
      <View style={{ flex: 1, gap: spacing[0.5] }}>
        <Text style={trS.label}>{label}</Text>
        {subtitle && <Text style={trS.subtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: colors.border, true: tint + '55' }}
        thumbColor={value ? tint : colors.textDisabled}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

const trS = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3.5], paddingHorizontal: spacing[4] },
  bordered: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  iconWrap: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  icon:     { fontSize: 18 },
  label:    { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.xs, color: colors.textTertiary },
});

// ─────────────────────────────────────────────────────────────
//  DANGER ROW  (destructive action)
// ─────────────────────────────────────────────────────────────

interface DangerRowProps {
  icon:    string;
  label:   string;
  onPress: () => void;
  isLast?: boolean;
}

export function DangerRow({ icon, label, onPress, isLast }: DangerRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      style={[danS.row, !isLast && danS.bordered]}
    >
      <View style={danS.iconWrap}>
        <Text style={danS.icon}>{icon}</Text>
      </View>
      <Text style={danS.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const danS = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[4], paddingHorizontal: spacing[4] },
  bordered: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  iconWrap: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.errorLight, flexShrink: 0 },
  icon:     { fontSize: 18 },
  label:    { flex: 1, fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.error },
});

// ─────────────────────────────────────────────────────────────
//  INFO ROW  (static display, no action)
// ─────────────────────────────────────────────────────────────

export function InfoRow({
  label, value, isLast,
}: { label: string; value: string; isLast?: boolean }) {
  return (
    <View style={[infoS.row, !isLast && infoS.bordered]}>
      <Text style={infoS.label}>{label}</Text>
      <Text style={infoS.value}>{value}</Text>
    </View>
  );
}

const infoS = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[4], paddingHorizontal: spacing[4] },
  bordered: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  label:    { fontSize: fontSize.base, color: colors.textPrimary, fontWeight: fontWeight.medium },
  value:    { fontSize: fontSize.sm, color: colors.textTertiary, maxWidth: '55%', textAlign: 'right' },
});

// ─────────────────────────────────────────────────────────────
//  AVATAR BLOCK  (profile hero)
// ─────────────────────────────────────────────────────────────

interface AvatarBlockProps {
  user:    UserProfile;
  onEdit?: () => void;
}

export function AvatarBlock({ user, onEdit }: AvatarBlockProps) {
  const initials = user.firstName.charAt(0).toUpperCase();
  const phaseColor =
    user.activePhase === 'cycle'      ? colors.phaseCycle      :
    user.activePhase === 'pregnancy'  ? colors.phasePregnancy  :
    colors.phasePostpartum;

  return (
    <View style={avS.wrap}>
      {/* Avatar */}
      <View style={avS.avatarWrap}>
        <View style={[avS.avatar, { borderColor: phaseColor + '55' }]}>
          <Text style={[avS.initials, { color: phaseColor }]}>{initials}</Text>
        </View>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={avS.editBadge}>
            <Text style={{ fontSize: 12 }}>✏️</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Name + email */}
      <Text style={avS.name}>{user.firstName}</Text>
      <Text style={avS.email}>{user.email}</Text>

      {/* Phase badge */}
      <View style={[avS.phaseBadge, { backgroundColor: phaseColor + '18', borderColor: phaseColor + '44' }]}>
        <Text style={{ fontSize: 14 }}>{PHASE_EMOJIS[user.activePhase]}</Text>
        <Text style={[avS.phaseLabel, { color: phaseColor }]}>
          {PHASE_LABELS[user.activePhase]}
        </Text>
      </View>
    </View>
  );
}

const avS = StyleSheet.create({
  wrap:       { alignItems: 'center', gap: spacing[2], paddingVertical: spacing[6] },
  avatarWrap: { position: 'relative', marginBottom: spacing[1] },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.md,
  },
  initials:   { fontSize: fontSize['3xl'], fontWeight: fontWeight.extraBold },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.xs,
  },
  name:       { fontSize: fontSize.xl, fontWeight: fontWeight.extraBold, color: colors.textPrimary, letterSpacing: -0.3 },
  email:      { fontSize: fontSize.sm, color: colors.textTertiary },
  phaseBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing[1.5], borderRadius: radius.full, paddingHorizontal: spacing[4], paddingVertical: spacing[1.5], borderWidth: 1.5, marginTop: spacing[1] },
  phaseLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold },
});

// ─────────────────────────────────────────────────────────────
//  SEGMENT CONTROL  (for theme / units pickers)
// ─────────────────────────────────────────────────────────────

interface SegmentControlProps {
  options: { label: string; value: string }[];
  value:   string;
  onChange: (v: string) => void;
  style?:  ViewStyle;
}

export function SegmentControl({ options, value, onChange, style }: SegmentControlProps) {
  return (
    <View style={[segS.wrap, style]}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[segS.btn, active && segS.btnActive]}
          >
            <Text style={[segS.label, active && segS.labelActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const segS = StyleSheet.create({
  wrap:       { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing[0.5], borderWidth: 1, borderColor: colors.border },
  btn:        { flex: 1, paddingVertical: spacing[2], alignItems: 'center', borderRadius: radius.md },
  btnActive:  { backgroundColor: colors.surface, ...shadows.xs },
  label:      { fontSize: fontSize.sm, color: colors.textTertiary, fontWeight: fontWeight.medium },
  labelActive: { color: colors.textPrimary, fontWeight: fontWeight.semiBold },
});

// ─────────────────────────────────────────────────────────────
//  FORM FIELD WRAPPER
// ─────────────────────────────────────────────────────────────

export function FormField({
  label, required, children, hint, style,
}: { label: string; required?: boolean; children: React.ReactNode; hint?: string; style?: ViewStyle }) {
  return (
    <View style={[{ gap: spacing[1.5] }, style]}>
      <Text style={ffS.label}>
        {label}
        {required && <Text style={{ color: colors.primary }}> *</Text>}
      </Text>
      {children}
      {hint && <Text style={ffS.hint}>{hint}</Text>}
    </View>
  );
}

const ffS = StyleSheet.create({
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textPrimary },
  hint:  { fontSize: fontSize.xs, color: colors.textTertiary },
});
