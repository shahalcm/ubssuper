// src/services/notifications/pushNotificationService.ts
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { useNotificationsStore } from '@/store/notificationsStore';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const ANDROID_CHANNELS = {
  DEFAULT: 'default',
  ORDERS: 'orders',
  RIDES: 'rides',
  PROMOTIONS: 'promotions',
};

/**
 * Configure Android notification channels for proper grouping, importance, sound, and vibrations.
 */
export async function setupAndroidNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNELS.DEFAULT, {
      name: 'General Notifications',
      description: 'Account, security, and general app alerts',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0F5132',
    });

    await Notifications.setNotificationChannelAsync(ANDROID_CHANNELS.ORDERS, {
      name: 'Order Updates',
      description: 'Real-time order confirmation, preparation, and delivery status',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 250, 500],
      sound: 'default',
      lightColor: '#10B981',
      enableLights: true,
      enableVibrate: true,
    });

    await Notifications.setNotificationChannelAsync(ANDROID_CHANNELS.RIDES, {
      name: 'Taxi & Rides',
      description: 'Driver assigned, driver arrived, trip updates, and completion',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 500, 500],
      sound: 'default',
      lightColor: '#F59E0B',
      enableLights: true,
      enableVibrate: true,
    });

    await Notifications.setNotificationChannelAsync(ANDROID_CHANNELS.PROMOTIONS, {
      name: 'Offers & Announcements',
      description: 'Promotional deals, discounts, and system announcements',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#3B82F6',
    });
  } catch (error) {
    console.warn('[PushNotifications] Failed to setup Android notification channels:', error);
  }
}

let cachedDeviceToken: string | null = null;
let cachedExpoToken: string | null = null;

/**
 * Request notification permissions and obtain both native FCM token and Expo Push Token.
 */
export async function registerForPushNotificationsAsync(): Promise<{
  fcmToken?: string;
  expoPushToken?: string;
} | null> {
  try {
    await setupAndroidNotificationChannels();

    if (!Device.isDevice) {
      console.log('[PushNotifications] Push notifications are not supported on physical simulator/emulator without Google Play Services');
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[PushNotifications] Notification permissions not granted');
      return null;
    }

    let fcmToken: string | undefined;
    let expoPushToken: string | undefined;

    // 1. Attempt to obtain native FCM Device Push Token (used for direct Firebase Admin SDK delivery)
    try {
      const deviceTokenObj = await Notifications.getDevicePushTokenAsync();
      if (deviceTokenObj && deviceTokenObj.data) {
        fcmToken = deviceTokenObj.data;
        cachedDeviceToken = fcmToken ?? null;
      }
    } catch (err: any) {
      console.log('[PushNotifications] Native device token not available:', err.message);
    }

    // 2. Attempt to obtain Expo Push Token (used for Expo Push Notification API)
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ||
        Constants?.easConfig?.projectId ||
        'f4addffb-14d6-4776-90b6-4e9e568a3ddc';

      const expoTokenObj = await Notifications.getExpoPushTokenAsync({ projectId });
      if (expoTokenObj && expoTokenObj.data) {
        expoPushToken = expoTokenObj.data;
        cachedExpoToken = expoPushToken ?? null;
      }
    } catch (err: any) {
      console.log('[PushNotifications] Expo push token not available:', err.message);
    }

    // Send tokens to backend
    const activeToken = fcmToken || expoPushToken;
    if (activeToken) {
      await syncTokenWithBackend(activeToken, fcmToken ? 'fcm' : 'expo');
    }

    return { fcmToken, expoPushToken };
  } catch (error: any) {
    console.error('[PushNotifications] Error during push notification registration:', error);
    return null;
  }
}

/**
 * Synchronize device token with backend API.
 */
export async function syncTokenWithBackend(token: string, tokenType: 'fcm' | 'expo' = 'fcm'): Promise<void> {
  try {
    await apiClient.post(ENDPOINTS.NOTIFICATIONS.REGISTER_TOKEN, {
      token,
      tokenType,
      platform: Platform.OS,
      deviceModel: Device.modelName || 'Unknown Device',
    });
    console.log('[PushNotifications] Successfully registered device push token with backend');
  } catch (error: any) {
    // Non-critical if offline or unauthenticated
    console.log('[PushNotifications] Token registration pending login or network:', error.message);
  }
}

/**
 * Unregister device token with backend API upon logout.
 */
export async function unregisterDeviceToken(): Promise<void> {
  const token = cachedDeviceToken || cachedExpoToken;
  if (!token) return;

  try {
    await apiClient.post(ENDPOINTS.NOTIFICATIONS.DELETE_TOKEN, { token });
    console.log('[PushNotifications] Successfully unregistered device token from backend');
  } catch (error: any) {
    console.log('[PushNotifications] Could not unregister token on backend:', error.message);
  } finally {
    cachedDeviceToken = null;
    cachedExpoToken = null;
  }
}

/**
 * Handle incoming notification when tapped by user to navigate to the relevant app screen.
 */
export function handleNotificationTap(response: Notifications.NotificationResponse): void {
  const data = response?.notification?.request?.content?.data as Record<string, any> | undefined;
  if (!data) return;

  try {
    // 1. Direct screen path provided
    if (data.screen && typeof data.screen === 'string') {
      router.push(data.screen as any);
      return;
    }

    // 2. Order update notification
    if (data.orderId) {
      router.push(`/orders/${data.orderId}` as any);
      return;
    }

    // 3. Taxi / ride update notification
    if (data.rideId) {
      router.push('/taxi/booking' as any);
      return;
    }

    // 4. Category-based fallback
    if (data.category === 'order') {
      router.push('/(tabs)/orders' as any);
    } else if (data.category === 'ride') {
      router.push('/taxi' as any);
    } else if (data.category === 'promo') {
      router.push('/offers' as any);
    } else {
      router.push('/notifications' as any);
    }
  } catch (err) {
    console.warn('[PushNotifications] Navigation error on notification tap:', err);
  }
}

/**
 * Ingest incoming notification into in-app notifications store for badge & UI sync.
 */
export function recordIncomingNotification(notification: Notifications.Notification): void {
  const content = notification.request.content;
  const data = (content.data || {}) as Record<string, any>;

  const categoryMap: Record<string, 'order' | 'ride' | 'promo' | 'account'> = {
    order: 'order',
    ride: 'ride',
    promo: 'promo',
    account: 'account',
  };

  const category = categoryMap[data.category] || 'account';

  useNotificationsStore.getState().addNotification({
    id: notification.request.identifier || `notif_${Date.now()}`,
    title: content.title || 'UBS Super Alert',
    message: content.body || '',
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    category,
    isRead: false,
  });
}
