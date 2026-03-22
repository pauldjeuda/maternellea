/**
 * navigation/stacks/HomeStack.tsx
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParams } from '@types/navigation';
import { HomeScreen } from '@features/home/screens/HomeScreen';

const Stack = createNativeStackNavigator<HomeStackParams>();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeDashboard" component={HomeScreen} />
    </Stack.Navigator>
  );
}
