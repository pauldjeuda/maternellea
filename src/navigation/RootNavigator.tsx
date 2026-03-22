/**
 * navigation/RootNavigator.tsx
 *
 * The single source of truth for routing.
 *
 * Routing logic:
 *   !isAuthenticated  → AuthStack   (Welcome / SignIn / SignUp / ForgotPwd)
 *   isAuthenticated
 *     && !onboarded   → OnboardingStack
 *     && onboarded    → MainTabs
 *
 * The Splash screen is shown once on first mount, then the
 * navigator replaces it based on auth state.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore, selectIsAuth, selectIsOnboarded } from '@store/authStore';
import { RootStackParams } from '@types/navigation';

import { SplashScreen }      from '@features/auth/screens/SplashScreen';
import { AuthNavigator }     from './stacks/AuthNavigator';
import { OnboardingNavigator } from './stacks/OnboardingNavigator';
import { MainTabNavigator }  from './tabs/MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParams>();

export function RootNavigator() {
  const isAuthenticated      = useAuthStore(selectIsAuth);
  const isOnboardingComplete = useAuthStore(selectIsOnboarded);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation:   'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        {/* Splash always first — redirects internally */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {!isAuthenticated ? (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ animation: 'fade' }}
          />
        ) : !isOnboardingComplete ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingNavigator}
            options={{ animation: 'slide_from_right' }}
          />
        ) : (
          <Stack.Screen
            name="MainTabs"
            component={MainTabNavigator}
            options={{ animation: 'fade' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
