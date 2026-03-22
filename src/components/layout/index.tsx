/**
 * components/layout/index.tsx
 *
 * Layout wrappers used by every screen.
 * Handles safe-area, keyboard avoidance, and scroll consistently.
 */

import React from 'react';
import {
  View, ScrollView, KeyboardAvoidingView,
  Platform, StyleSheet, ViewStyle, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '@theme/tokens';

const { colors, spacing } = tokens;

// ─────────────────────────────────────────────────────────────
//  SCREEN
//  Basic full-screen container with background + safe-area.
// ─────────────────────────────────────────────────────────────

interface ScreenProps {
  children:    React.ReactNode;
  style?:      ViewStyle;
  edges?:      ('top' | 'bottom' | 'left' | 'right')[];
  noPadding?:  boolean;
  background?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  edges = ['left', 'right', 'bottom'],
  noPadding,
  background = colors.background,
}) => (
  <SafeAreaView
    edges={edges}
    style={[{ flex: 1, backgroundColor: background }, style]}
  >
    <StatusBar barStyle="dark-content" backgroundColor={background} />
    {noPadding ? children : (
      <View style={[styles.padded, style]}>
        {children}
      </View>
    )}
  </SafeAreaView>
);

// ─────────────────────────────────────────────────────────────
//  SCROLL SCREEN
//  Screen + ScrollView + KeyboardAvoidingView
// ─────────────────────────────────────────────────────────────

interface ScrollScreenProps extends ScreenProps {
  contentStyle?:    ViewStyle;
  bottomInset?:     boolean;
  refreshControl?:  React.ReactElement;
}

export const ScrollScreen: React.FC<ScrollScreenProps> = ({
  children, style, contentStyle, noPadding, background = colors.background,
  bottomInset = true, refreshControl,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[{ flex: 1, backgroundColor: background }, style]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={background} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            { paddingBottom: bottomInset ? insets.bottom + spacing[6] : spacing[6] },
            noPadding ? undefined : styles.padded,
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
//  KEYBOARD SCREEN
//  Screen + KeyboardAvoidingView (no scroll — for forms that
//  fit in one viewport without scrolling)
// ─────────────────────────────────────────────────────────────

export const KeyboardScreen: React.FC<ScreenProps> = ({
  children, style, noPadding, background = colors.background,
}) => (
  <SafeAreaView
    edges={['left', 'right', 'bottom']}
    style={[{ flex: 1, backgroundColor: background }, style]}
  >
    <StatusBar barStyle="dark-content" backgroundColor={background} />
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {noPadding ? children : (
        <View style={[styles.padded, { flex: 1 }]}>
          {children}
        </View>
      )}
    </KeyboardAvoidingView>
  </SafeAreaView>
);

// ─────────────────────────────────────────────────────────────
//  FULL SCREEN  (no safe-area, edge-to-edge — for splash etc.)
// ─────────────────────────────────────────────────────────────

export const FullScreen: React.FC<{ children: React.ReactNode; style?: ViewStyle; background?: string }> = ({
  children, style, background = colors.background,
}) => (
  <View style={[{ flex: 1, backgroundColor: background }, style]}>
    <StatusBar barStyle="dark-content" backgroundColor={background} translucent />
    {children}
  </View>
);

// ─────────────────────────────────────────────────────────────
//  SPACER
// ─────────────────────────────────────────────────────────────

export const Spacer: React.FC<{ size?: number; flex?: boolean }> = ({
  size = spacing[4], flex,
}) => (
  <View style={flex ? { flex: 1 } : { height: size }} />
);

// ─────────────────────────────────────────────────────────────
//  SECTION
// ─────────────────────────────────────────────────────────────

interface SectionProps {
  children: React.ReactNode;
  style?:   ViewStyle;
  gap?:     number;
}

export const Section: React.FC<SectionProps> = ({ children, style, gap = spacing[4] }) => (
  <View style={[{ gap }, style]}>
    {children}
  </View>
);

// ─────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  padded: {
    flex:             1,
    paddingHorizontal: spacing[6],
  },
});
