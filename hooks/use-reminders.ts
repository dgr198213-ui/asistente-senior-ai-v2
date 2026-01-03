import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

export type ReminderType = "medication" | "appointment" | "general";

export type Reminder = {
  id: string;
  title: string;
  time: string;
  date: string;
  type: ReminderType;
  completed: boolean;
  repeat?: "daily" | "weekly" | "none";
  notificationId?: string;
  completedAt?: string;
};

const REMINDERS_STORAGE_KEY = "@asistente_senior_reminders";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load reminders from AsyncStorage
  const loadReminders = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (stored) {
        setReminders(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load reminders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save reminders to AsyncStorage
  const saveReminders = useCallback(async (newReminders: Reminder[]) => {
    try {
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(newReminders));
      setReminders(newReminders);
    } catch (error) {
      console.error("Failed to save reminders:", error);
    }
  }, []);

  // Schedule notification for a reminder
  const scheduleNotification = useCallback(async (reminder: Reminder): Promise<string | null> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("Notification permissions not granted");
        return null;
      }

      // Parse time (format: "HH:MM")
      const [hours, minutes] = reminder.time.split(":").map(Number);
      const now = new Date();
      const scheduledDate = new Date(reminder.date);
      scheduledDate.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (scheduledDate < now) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Recordatorio",
          body: reminder.title,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: reminder.repeat === "daily"
          ? { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: hours, minute: minutes }
          : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: scheduledDate },
      });

      return notificationId;
    } catch (error) {
      console.error("Failed to schedule notification:", error);
      return null;
    }
  }, []);

  // Cancel notification
  const cancelNotification = useCallback(async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error("Failed to cancel notification:", error);
    }
  }, []);

  // Add new reminder
  const addReminder = useCallback(
    async (reminder: Omit<Reminder, "id" | "completed" | "notificationId">) => {
      const newReminder: Reminder = {
        ...reminder,
        id: Date.now().toString(),
        completed: false,
      };

      // Schedule notification
      const notificationId = await scheduleNotification(newReminder);
      if (notificationId) {
        newReminder.notificationId = notificationId;
      }

      const updated = [...reminders, newReminder];
      await saveReminders(updated);
    },
    [reminders, saveReminders, scheduleNotification]
  );

  // Update reminder
  const updateReminder = useCallback(
    async (id: string, updates: Partial<Reminder>) => {
      const updated = reminders.map((r) => {
        if (r.id === id) {
          return { ...r, ...updates };
        }
        return r;
      });
      await saveReminders(updated);
    },
    [reminders, saveReminders]
  );

  // Toggle reminder completion
  const toggleReminder = useCallback(
    async (id: string) => {
      const reminder = reminders.find((r) => r.id === id);
      if (!reminder) return;

      const updated = reminders.map((r) => {
        if (r.id === id) {
          return { ...r, completed: !r.completed, completedAt: !r.completed ? new Date().toISOString() : undefined };
        }
        return r;
      });

      // Cancel notification if completing
      if (!reminder.completed && reminder.notificationId) {
        await cancelNotification(reminder.notificationId);
      }

      await saveReminders(updated);
    },
    [reminders, saveReminders, cancelNotification]
  );

  // Delete reminder
  const deleteReminder = useCallback(
    async (id: string) => {
      const reminder = reminders.find((r) => r.id === id);
      if (reminder?.notificationId) {
        await cancelNotification(reminder.notificationId);
      }

      const updated = reminders.filter((r) => r.id !== id);
      await saveReminders(updated);
    },
    [reminders, saveReminders, cancelNotification]
  );

  // Get pending reminders count
  const getPendingCount = useCallback(() => {
    return reminders.filter((r) => !r.completed).length;
  }, [reminders]);

  // Get today's reminders
  const getTodayReminders = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return reminders.filter((r) => r.date === today);
  }, [reminders]);

  // Load reminders on mount
  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  return {
    reminders,
    isLoading,
    addReminder,
    updateReminder,
    toggleReminder,
    deleteReminder,
    getPendingCount,
    getTodayReminders,
  };
}
