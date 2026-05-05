import { Platform } from 'react-native';
import { NotificationConfig } from '../store/types';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Helper to determine if we are in Expo Go
const isExpoGo = 
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient || 
  (Constants as any).appOwnership === 'expo' ||
  !!(Constants as any).expoVersion;

// Helper to get Notifications safely
const getNotifications = () => {
  if (isExpoGo) {
    return null;
  }
  
  try {
    return require('expo-notifications');
  } catch (e) {
    return null;
  }
};

export async function requestNotificationPermissions() {
  const Notifications = getNotifications();
  if (!Notifications) {
    if (isExpoGo) {
      console.warn('Notifications (expo-notifications) is restricted in Expo Go SDK 53+. Please use a development build.');
    }
    return false;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
}

export async function scheduleTodoNotification(
  todoName: string,
  config: NotificationConfig
): Promise<string | undefined> {
  const Notifications = getNotifications();
  if (!Notifications) {
    if (isExpoGo) {
      console.warn('Cannot schedule notification: expo-notifications is incompatible with Expo Go. Use a development build.');
    }
    return undefined;
  }

  if (!config.isActive || !config.datetime) return undefined;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('Notification permission not granted');
    return undefined;
  }

  // Cancel existing if any
  if (config.notificationId) {
    await cancelNotification(config.notificationId);
  }

  const date = new Date(config.datetime);
  if (date.getTime() < Date.now() && config.repeat === 'none') {
    console.log('Cannot schedule non-repeating notification in the past');
    return undefined;
  }

  let trigger: any;

  if (config.repeat === 'none') {
    trigger = date;
  } else if (config.repeat === 'daily') {
    trigger = {
      hour: date.getHours(),
      minute: date.getMinutes(),
      repeats: true,
    };
  } else if (config.repeat === 'weekly' && config.daysOfWeek && config.daysOfWeek.length > 0) {
    trigger = {
      weekday: config.daysOfWeek[0] + 1,
      hour: date.getHours(),
      minute: date.getMinutes(),
      repeats: true,
    };
  } else {
    trigger = date;
  }

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Hadaf Reminder',
        body: todoName,
        sound: true,
      },
      trigger,
    });
    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return undefined;
  }
}

export async function cancelNotification(notificationId: string) {
  const Notifications = getNotifications();
  if (!Notifications) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}
