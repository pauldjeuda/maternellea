/**
 * navigation/stacks/AdviceStack.tsx
 * Wired to real Conseils screens.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AdviceStackParams } from '@types/navigation';
import { defaultHeaderOptions } from '../helpers';
import { tokens } from '@theme/tokens';

import { TipsHomeScreen }       from '@features/advice/screens/TipsHomeScreen';
import { ArticleListScreen }    from '@features/advice/screens/ArticleListScreen';
import { ArticleDetailScreen }  from '@features/advice/screens/ArticleDetailScreen';
import { SearchArticlesScreen } from '@features/advice/screens/SearchArticlesScreen';
import { FavoritesScreen }      from '@features/advice/screens/FavoritesScreen';

const Stack = createNativeStackNavigator<AdviceStackParams>();
const { colors } = tokens;

export function AdviceStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultHeaderOptions,
        headerStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Home — no header (custom title in screen) */}
      <Stack.Screen
        name="AdviceList"
        component={TipsHomeScreen}
        options={{ headerShown: false }}
      />

      {/* Article detail — transparent header, back only */}
      <Stack.Screen
        name="AdviceDetail"
        component={ArticleDetailScreen}
        options={{ headerShown: false }}
      />

      {/* Search — full-screen, no header */}
      <Stack.Screen
        name="AdviceSearch"
        component={SearchArticlesScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />

      {/* Favorites */}
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
