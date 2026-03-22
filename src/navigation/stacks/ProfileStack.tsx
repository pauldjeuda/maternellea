/**
 * navigation/stacks/ProfileStack.tsx
 *
 * Profile tab stack — wired to all real profile screens.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParams } from '@types/navigation';
import { defaultHeaderOptions } from '../helpers';

import { ProfileHomeScreen }            from '@features/profile/screens/ProfileHomeScreen';
import { EditProfileScreen }            from '@features/profile/screens/EditProfileScreen';
import { NotificationSettingsScreen }   from '@features/profile/screens/NotificationSettingsScreen';
import { PreferencesScreen }            from '@features/profile/screens/PreferencesScreen';
import { ChangeJourneyScreen }          from '@features/profile/screens/ChangeJourneyScreen';
import { PrivacyScreen, AboutScreen }   from '@features/profile/screens/PrivacyAndAboutScreens';

const Stack = createNativeStackNavigator<ProfileStackParams>();

export function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultHeaderOptions,
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="ProfileHome"
        component={ProfileHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Mon profil' }}
      />
      <Stack.Screen
        name="Preferences"
        component={PreferencesScreen}
        options={{ title: 'Préférences' }}
      />
      <Stack.Screen
        name="NotificationPrefs"
        component={NotificationSettingsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="ChangePhase"
        component={ChangeJourneyScreen}
        options={{ title: 'Mon parcours' }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: 'Confidentialité' }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'À propos' }}
      />
    </Stack.Navigator>
  );
}
