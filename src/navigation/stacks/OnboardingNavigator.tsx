/**
 * navigation/stacks/OnboardingNavigator.tsx
 *
 * Onboarding wizard:
 *   OnboardingSlides → InitialProfileSetup → JourneySelection
 *     → [PregnancySetup | PostpartumSetup] → MainTabs (via root replace)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParams } from '@types/navigation';
import { tokens } from '@theme/tokens';

import { OnboardingSlidesScreen }     from '@features/onboarding/screens/OnboardingSlidesScreen';
import { InitialProfileSetupScreen }  from '@features/onboarding/screens/InitialProfileSetupScreen';
import { JourneySelectionScreen }     from '@features/onboarding/screens/JourneySelectionScreen';
import { PregnancySetupScreen }       from '@features/onboarding/screens/PregnancySetupScreen';
import { PostpartumSetupScreen }      from '@features/onboarding/screens/PostpartumSetupScreen';

const Stack = createNativeStackNavigator<OnboardingStackParams>();
const { colors } = tokens;

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown:       false,
        contentStyle:      { backgroundColor: colors.background },
        animation:         'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="OnboardingSlides"  component={OnboardingSlidesScreen} />
      <Stack.Screen name="UserSetup"         component={InitialProfileSetupScreen} />
      <Stack.Screen name="PhaseSelection"    component={JourneySelectionScreen} />
      <Stack.Screen name="PregnancySetup"    component={PregnancySetupScreen} />
      <Stack.Screen name="BabySetup"         component={PostpartumSetupScreen} />
    </Stack.Navigator>
  );
}
