/**
 * navigation/tabs/MainTabNavigator.tsx
 * Bottom tab navigator with AppTabBar and all real feature stacks.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParams } from '@types/navigation';
import { AppTabBar } from '../components/AppTabBar';

// Feature stacks
import { HomeStack }     from '../stacks/HomeStack';
import { CalendarStack } from '../stacks/CalendarStack';
import { TrackingStack } from '../stacks/TrackingStack';
import { AdviceStack }   from '../stacks/AdviceStack';
import { ProfileStack }  from '../stacks/ProfileStack';

const Tab = createBottomTabNavigator<MainTabParams>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab"     component={HomeStack}     />
      <Tab.Screen name="CalendarTab" component={CalendarStack} />
      <Tab.Screen name="TrackingTab" component={TrackingStack} />
      <Tab.Screen name="AdviceTab"   component={AdviceStack}   />
      <Tab.Screen name="ProfileTab"  component={ProfileStack}  />
    </Tab.Navigator>
  );
}
