/**
 * navigation/stacks/AuthNavigator.tsx
 *
 * Auth flow: Welcome → SignIn | SignUp → ForgotPassword
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParams } from '@types/navigation';
import { tokens } from '@theme/tokens';

import { WelcomeScreen }       from '@features/auth/screens/WelcomeScreen';
import { SignInScreen }        from '@features/auth/screens/SignInScreen';
import { SignUpScreen }        from '@features/auth/screens/SignUpScreen';
import { ForgotPasswordScreen } from '@features/auth/screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParams>();
const { colors } = tokens;

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown:      false,
        contentStyle:     { backgroundColor: colors.background },
        animation:        'slide_from_right',
        animationDuration: 280,
      }}
    >
      <Stack.Screen name="Welcome"        component={WelcomeScreen} />
      <Stack.Screen name="Login"          component={SignInScreen} />
      <Stack.Screen name="Register"       component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
