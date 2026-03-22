/**
 * App.tsx
 * Root component — mounts all global providers then the navigator.
 *
 * Provider order matters:
 *   GestureHandler  (must wrap everything)
 *   └─ SafeArea     (device notch/home-bar insets)
 *      └─ Theme     (design tokens via context)
 *         └─ Query  (server-state cache, ready for real API)
 *            └─ AppInitializer  (boot logic: load stores, request permissions)
 *               └─ RootNavigator
 */

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { ThemeProvider }       from '@providers/ThemeProvider';
import { AppInitializer }      from '@providers/AppInitializer';
import { NotificationProvider } from '@providers/NotificationProvider';
import { RootNavigator }       from '@navigation/RootNavigator';

export default function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NotificationProvider>
            <AppInitializer>
              <RootNavigator />
            </AppInitializer>
          </NotificationProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
