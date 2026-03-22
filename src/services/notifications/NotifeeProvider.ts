/**
 * services/notifications/NotifeeProvider.ts
 *
 * Concrete INotificationProvider backed by react-native-notifee.
 *
 * To swap providers (e.g. to Expo Notifications):
 *   1. Create ExpoProvider.ts implementing INotificationProvider
 *   2. Change the export in NotificationService.ts
 *   3. Zero changes in feature code
 */

import notifee, {
  AndroidImportance,
  AndroidStyle,
  AuthorizationStatus,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { Platform } from 'react-native';

import type { INotificationProvider, ScheduleRequest } from './types';
import { APP_CHANNELS, channelIdForType } from './types';

// ─────────────────────────────────────────────────────────────
//  NOTIFEE PROVIDER
// ─────────────────────────────────────────────────────────────

class NotifeeProviderImpl implements INotificationProvider {

  async setup(): Promise<void> {
    if (Platform.OS !== 'android') return;

    await Promise.all(
      APP_CHANNELS.map(ch =>
        notifee.createChannel({
          id:          ch.id,
          name:        ch.name,
          description: ch.description,
          importance:  ch.importance === 'high'    ? AndroidImportance.HIGH
                     : ch.importance === 'low'     ? AndroidImportance.LOW
                     : AndroidImportance.DEFAULT,
          sound:       ch.sound ? 'default' : undefined,
          vibration:   ch.vibration,
        }),
      ),
    );
  }

  async requestPermission(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return (
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
    );
  }

  async schedule(req: ScheduleRequest): Promise<string> {
    const fireDate = new Date(req.fireAt);

    // Don't schedule if time is in the past
    if (fireDate.getTime() <= Date.now()) {
      throw new Error(`[NotifeeProvider] fireAt is in the past: ${req.fireAt}`);
    }

    const trigger: TimestampTrigger = {
      type:      TriggerType.TIMESTAMP,
      timestamp: fireDate.getTime(),
      ...(req.recurring && req.intervalDays === 7
        ? { repeatFrequency: RepeatFrequency.WEEKLY }
        : req.recurring && req.intervalDays === 1
        ? { repeatFrequency: RepeatFrequency.DAILY }
        : {}),
    };

    const channelId = channelIdForType(req.type);

    const notifId = await notifee.createTriggerNotification(
      {
        id:    req.id,
        title: req.title,
        body:  req.body,
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          style: {
            type:  AndroidStyle.BIGTEXT,
            text:  req.body,
            title: req.title,
          },
          pressAction:   { id: 'default' },
          smallIcon:     'ic_notification',  // must exist in android/app/src/main/res/
        },
        ios: {
          sound:       'default',
          categoryId:  req.type,
        },
        data: {
          reminderId: req.id,
          type:       req.type,
          ...(req.payload ?? {}),
        },
      },
      trigger,
    );

    return notifId;
  }

  async cancel(systemId: string): Promise<void> {
    await notifee.cancelNotification(systemId);
  }

  async cancelAll(): Promise<void> {
    await notifee.cancelAllNotifications();
  }

  async displayNow(req: Pick<ScheduleRequest, 'type' | 'title' | 'body'>): Promise<void> {
    await notifee.displayNotification({
      title:   req.title,
      body:    req.body,
      android: { channelId: channelIdForType(req.type), pressAction: { id: 'default' } },
      ios:     { sound: 'default' },
    });
  }

  async getPendingIds(): Promise<string[]> {
    return notifee.getTriggerNotificationIds();
  }
}

export const NotifeeProvider = new NotifeeProviderImpl();
