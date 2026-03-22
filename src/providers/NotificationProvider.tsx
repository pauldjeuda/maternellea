/**
 * providers/NotificationProvider.tsx
 *
 * Handles foreground notification events app-wide.
 * Background events are handled by the headless task in index.js.
 */

import React, { useEffect } from 'react';
import notifee, { EventType } from '@notifee/react-native';

interface Props { children: React.ReactNode; }

export const NotificationProvider: React.FC<Props> = ({ children }) => {
  useEffect(() => {
    // Foreground event listener
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.PRESS:
          // Navigate to relevant screen based on detail.notification?.data
          // This will be wired up when deep linking is implemented
          console.log('[Notification] Pressed:', detail.notification?.id);
          break;
        case EventType.DISMISSED:
          break;
      }
    });
    return unsubscribe;
  }, []);

  return <>{children}</>;
};
