/**
 * components/ui/index.tsx
 *
 * Core design-system components used throughout the app.
 * Every component reads from theme tokens — zero hard-coded values.
 *
 * Exports: Text · Button · Input · PasswordInput · Checkbox
 *          Badge · ProgressBar · Divider · Avatar · Tag
 */

import React, { useState, forwardRef } from 'react';
import {
  Text as RNText,
  TextInput as RNTextInput,
  TouchableOpacity,
  Pressable,
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Image,
} from 'react-native';

import { tokens } from '@theme/tokens';
import { textPresets, TextPreset } from '@theme/index';

const { colors, spacing, radius, fontSize, fontWeight, shadows, iconSize } = tokens;

// ─────────────────────────────────────────────────────────────
//  TEXT
// ─────────────────────────────────────────────────────────────

interface TextProps {
  preset?:       TextPreset;
  color?:        string;
  align?:        'left' | 'center' | 'right';
  style?:        TextStyle;
  children:      React.ReactNode;
  numberOfLines?: number;
  onPress?:      () => void;
}

export const Text: React.FC<TextProps> = ({
  preset = 'body', color, align = 'left', style, children, numberOfLines, onPress,
}) => (
  <RNText
    numberOfLines={numberOfLines}
    onPress={onPress}
    style={[
      textPresets[preset],
      color ? { color } : undefined,
      align !== 'left' ? { textAlign: align } : undefined,
      style,
    ]}
  >
    {children}
  </RNText>
);

// ─────────────────────────────────────────────────────────────
//  BUTTON
// ─────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label:       string;
  onPress:     () => void;
  variant?:    ButtonVariant;
  size?:       ButtonSize;
  loading?:    boolean;
  disabled?:   boolean;
  fullWidth?:  boolean;
  leftIcon?:   React.ReactNode;
  rightIcon?:  React.ReactNode;
  style?:      ViewStyle;
  textStyle?:  TextStyle;
}

const BUTTON_VARIANTS: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
  primary:     { bg: colors.primary,    text: colors.textInverse,  border: colors.primary    },
  secondary:   { bg: colors.secondary,  text: colors.textInverse,  border: colors.secondary  },
  outline:     { bg: 'transparent',     text: colors.primary,      border: colors.primary    },
  ghost:       { bg: 'transparent',     text: colors.primary,      border: 'transparent'     },
  destructive: { bg: colors.error,      text: colors.textInverse,  border: colors.error      },
};

const BUTTON_SIZES: Record<ButtonSize, { paddingV: number; paddingH: number; fs: number; height: number }> = {
  sm: { paddingV: spacing[2],   paddingH: spacing[4],  fs: fontSize.sm,   height: 36 },
  md: { paddingV: spacing[3],   paddingH: spacing[6],  fs: fontSize.base, height: 48 },
  lg: { paddingV: spacing[3.5], paddingH: spacing[7],  fs: fontSize.md,   height: 56 },
};

export const Button: React.FC<ButtonProps> = ({
  label, onPress, variant = 'primary', size = 'md',
  loading, disabled, fullWidth, leftIcon, rightIcon, style, textStyle,
}) => {
  const v  = BUTTON_VARIANTS[variant];
  const sz = BUTTON_SIZES[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        btnStyles.base,
        {
          backgroundColor: v.bg,
          borderColor:     v.border,
          height:          sz.height,
          paddingHorizontal: sz.paddingH,
          opacity: isDisabled ? 0.52 : 1,
        },
        variant === 'primary' && shadows.colored,
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {leftIcon && <View style={btnStyles.iconLeft}>{leftIcon}</View>}
          <RNText style={[btnStyles.label, { color: v.text, fontSize: sz.fs }, textStyle]}>
            {label}
          </RNText>
          {rightIcon && <View style={btnStyles.iconRight}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const btnStyles = StyleSheet.create({
  base: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   radius.full,
    borderWidth:    1.5,
    alignSelf:      'stretch',
  },
  label: {
    fontWeight:  fontWeight.semiBold,
    letterSpacing: 0.1,
  },
  iconLeft:  { marginRight: spacing[2] },
  iconRight: { marginLeft:  spacing[2] },
});

// ─────────────────────────────────────────────────────────────
//  INPUT FIELD
// ─────────────────────────────────────────────────────────────

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?:       string;
  error?:       string;
  hint?:        string;
  leftIcon?:    React.ReactNode;
  rightAction?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?:  TextStyle;
  required?:    boolean;
}

export const Input = forwardRef<RNTextInput, InputProps>(({
  label, error, hint, leftIcon, rightAction,
  containerStyle, inputStyle, required, ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={[inputStyles.container, containerStyle]}>
      {label && (
        <View style={inputStyles.labelRow}>
          <RNText style={inputStyles.label}>{label}</RNText>
          {required && <RNText style={inputStyles.required}> *</RNText>}
        </View>
      )}

      <View
        style={[
          inputStyles.field,
          focused    && inputStyles.fieldFocused,
          hasError   && inputStyles.fieldError,
        ]}
      >
        {leftIcon && <View style={inputStyles.leftIcon}>{leftIcon}</View>}

        <RNTextInput
          ref={ref}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[inputStyles.input, inputStyle]}
          {...props}
        />

        {rightAction && <View style={inputStyles.rightAction}>{rightAction}</View>}
      </View>

      {hasError && (
        <View style={inputStyles.errorRow}>
          <RNText style={inputStyles.errorText}>⚠ {error}</RNText>
        </View>
      )}
      {!hasError && hint && (
        <RNText style={inputStyles.hint}>{hint}</RNText>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const inputStyles = StyleSheet.create({
  container: { gap: spacing[1] },
  labelRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[1] },
  label: {
    fontSize:   fontSize.sm,
    fontWeight: fontWeight.medium,
    color:      colors.textPrimary,
    letterSpacing: 0.2,
  },
  required:  { color: colors.primary, fontSize: fontSize.sm },
  field: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius:    radius.lg,
    borderWidth:     1.5,
    borderColor:     colors.border,
    minHeight:       52,
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  fieldFocused: {
    borderColor:     colors.borderFocus,
    backgroundColor: colors.surface,
    ...shadows.xs,
  },
  fieldError: {
    borderColor:     colors.borderError,
    backgroundColor: colors.errorLight,
  },
  input: {
    flex:       1,
    fontSize:   fontSize.base,
    color:      colors.textPrimary,
    paddingVertical: spacing[3],
  },
  leftIcon:    { },
  rightAction: { marginLeft: spacing[1] },
  errorRow:    { flexDirection: 'row', alignItems: 'center', marginTop: spacing[0.5] },
  errorText: {
    fontSize: fontSize.xs,
    color:    colors.errorText,
    fontWeight: fontWeight.medium,
  },
  hint: {
    fontSize: fontSize.xs,
    color:    colors.textTertiary,
    marginTop: spacing[0.5],
  },
});

// ─────────────────────────────────────────────────────────────
//  PASSWORD INPUT (toggleable visibility)
// ─────────────────────────────────────────────────────────────

interface PasswordInputProps extends Omit<InputProps, 'secureTextEntry' | 'rightAction'> {}

export const PasswordInput = forwardRef<RNTextInput, PasswordInputProps>((props, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      ref={ref}
      secureTextEntry={!visible}
      rightAction={
        <TouchableOpacity onPress={() => setVisible((v) => !v)} hitSlop={8}>
          <RNText style={{ fontSize: 18 }}>{visible ? '🙈' : '👁️'}</RNText>
        </TouchableOpacity>
      }
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

// ─────────────────────────────────────────────────────────────
//  CHECKBOX
// ─────────────────────────────────────────────────────────────

interface CheckboxProps {
  checked:   boolean;
  onToggle:  () => void;
  label?:    React.ReactNode;
  error?:    string;
  style?:    ViewStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked, onToggle, label, error, style,
}) => (
  <View style={style}>
    <Pressable
      onPress={onToggle}
      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] }}
    >
      <View
        style={[
          cbStyles.box,
          checked && cbStyles.boxChecked,
          !!error && cbStyles.boxError,
        ]}
      >
        {checked && <RNText style={cbStyles.check}>✓</RNText>}
      </View>
      {label && <View style={{ flex: 1, paddingTop: 2 }}>{label}</View>}
    </Pressable>
    {error && (
      <RNText style={[inputStyles.errorText, { marginTop: spacing[1] }]}>⚠ {error}</RNText>
    )}
  </View>
);

const cbStyles = StyleSheet.create({
  box: {
    width:          22,
    height:         22,
    borderRadius:   radius.xs,
    borderWidth:    2,
    borderColor:    colors.border,
    backgroundColor: colors.surface,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    marginTop:      1,
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor:     colors.primary,
  },
  boxError: { borderColor: colors.borderError },
  check: {
    color:      colors.textInverse,
    fontSize:   13,
    fontWeight: fontWeight.bold,
    lineHeight: 18,
  },
});

// ─────────────────────────────────────────────────────────────
//  BADGE
// ─────────────────────────────────────────────────────────────

interface BadgeProps {
  label:    string;
  color?:   string;
  bgColor?: string;
  size?:    'sm' | 'md';
  style?:   ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label, color = colors.primary, bgColor = colors.primaryLight, size = 'md', style,
}) => (
  <View
    style={[
      {
        backgroundColor: bgColor,
        borderRadius:    radius.full,
        paddingVertical:   size === 'sm' ? spacing[0.5] : spacing[1],
        paddingHorizontal: size === 'sm' ? spacing[2]   : spacing[3],
        alignSelf:       'flex-start',
      },
      style,
    ]}
  >
    <RNText style={{
      color,
      fontSize:   size === 'sm' ? fontSize.xs : fontSize.sm,
      fontWeight: fontWeight.semiBold,
    }}>
      {label}
    </RNText>
  </View>
);

// ─────────────────────────────────────────────────────────────
//  PROGRESS BAR
// ─────────────────────────────────────────────────────────────

interface ProgressBarProps {
  value:        number;  // 0–100
  color?:       string;
  trackColor?:  string;
  height?:      number;
  showPercent?: boolean;
  style?:       ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value, color = colors.primary, trackColor = colors.primaryLight,
  height = 8, showPercent, style,
}) => {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <View style={style}>
      <View style={{ height, backgroundColor: trackColor, borderRadius: radius.full, overflow: 'hidden' }}>
        <View
          style={{
            width:           `${pct}%`,
            height:          '100%',
            backgroundColor: color,
            borderRadius:    radius.full,
          }}
        />
      </View>
      {showPercent && (
        <RNText style={{ fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing[1], textAlign: 'right' }}>
          {Math.round(pct)} %
        </RNText>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
//  DIVIDER
// ─────────────────────────────────────────────────────────────

interface DividerProps {
  label?: string;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({ label, style }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }, style]}>
    <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    {label && (
      <RNText style={{ fontSize: fontSize.sm, color: colors.textTertiary, fontWeight: fontWeight.medium }}>
        {label}
      </RNText>
    )}
    {label && <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />}
  </View>
);

// ─────────────────────────────────────────────────────────────
//  AVATAR
// ─────────────────────────────────────────────────────────────

interface AvatarProps {
  name?:  string;
  uri?:   string;
  size?:  number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({ name, uri, size = 44, style }) => {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      />
    );
  }

  return (
    <View
      style={[
        {
          width:           size,
          height:          size,
          borderRadius:    size / 2,
          backgroundColor: colors.primaryLight,
          alignItems:      'center',
          justifyContent:  'center',
        },
        style,
      ]}
    >
      <RNText style={{ color: colors.primary, fontSize: size * 0.36, fontWeight: fontWeight.bold }}>
        {initials}
      </RNText>
    </View>
  );
};
