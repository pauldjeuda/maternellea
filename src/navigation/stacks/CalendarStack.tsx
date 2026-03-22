/**
 * navigation/stacks/CalendarStack.tsx
 * Wired to real calendar screens.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CalendarStackParams } from '@types/navigation';
import { defaultHeaderOptions } from '../helpers';
import { CalendarMainScreen } from '@features/calendar/screens/CalendarMainScreen';
import { EventDetailScreen }  from '@features/calendar/screens/EventDetailScreen';

const Stack = createNativeStackNavigator<CalendarStackParams>();

export function CalendarStack() {
  return (
    <Stack.Navigator
      screenOptions={{ ...defaultHeaderOptions, headerShown: false }}
    >
      <Stack.Screen name="CalendarMain" component={CalendarMainScreen} />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ headerShown: true, title: 'Détail' }}
      />
    </Stack.Navigator>
  );
}
