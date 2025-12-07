import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import roastEngine from './roastEngine';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#EF4444',
        });
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  async scheduleHabitReminders(settings) {
    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!settings.notificationsEnabled) return;

    const roastLevel = settings.roastLevel || 'normal';

    // Morning reminder
    const morningMessage = roastEngine.getContextualRoast({
      type: 'notification',
      roastLevel,
    });

    await this.scheduleNotification({
      title: 'Necessary Evil',
      body: morningMessage,
      hour: parseInt(settings.wakeUpTime.split(':')[0]) + 1,
      minute: 0,
    });

    // Midday reminder
    const middayMessage = roastEngine.getContextualRoast({
      type: 'notification',
      roastLevel,
    });

    await this.scheduleNotification({
      title: 'Necessary Evil',
      body: middayMessage,
      hour: 13,
      minute: 0,
    });

    // Evening reminder
    const eveningMessage = roastEngine.getContextualRoast({
      type: 'notification',
      roastLevel,
    });

    await this.scheduleNotification({
      title: 'Necessary Evil',
      body: eveningMessage,
      hour: parseInt(settings.doNotDisturb.start.split(':')[0]) - 1,
      minute: 0,
    });
  }

  async scheduleNotification({ title, body, hour, minute }) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'habit_reminder' },
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  async sendImmediateNotification(title, body) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export default new NotificationService();
