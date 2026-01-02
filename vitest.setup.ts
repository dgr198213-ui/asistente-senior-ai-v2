import { vi } from "vitest";

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: vi.fn(() => Promise.resolve(null)),
  setItem: vi.fn(() => Promise.resolve()),
  removeItem: vi.fn(() => Promise.resolve()),
  clear: vi.fn(() => Promise.resolve()),
  getAllKeys: vi.fn(() => Promise.resolve([])),
  multiGet: vi.fn(() => Promise.resolve([])),
  multiSet: vi.fn(() => Promise.resolve()),
  multiRemove: vi.fn(() => Promise.resolve()),
};

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: mockAsyncStorage,
}));

// Mock expo-notifications
vi.mock("expo-notifications", () => ({
  setNotificationHandler: vi.fn(),
  requestPermissionsAsync: vi.fn(() => Promise.resolve({ status: "granted" })),
  scheduleNotificationAsync: vi.fn(() => Promise.resolve("notification-id")),
  cancelScheduledNotificationAsync: vi.fn(() => Promise.resolve()),
  SchedulableTriggerInputTypes: {
    DAILY: "daily",
    DATE: "date",
  },
  AndroidNotificationPriority: {
    HIGH: "high",
  },
}));

// Mock expo-audio
vi.mock("expo-audio", () => ({
  useAudioRecorder: vi.fn(() => ({
    record: vi.fn(),
    stop: vi.fn(),
    prepareToRecordAsync: vi.fn(() => Promise.resolve()),
    uri: null,
  })),
  RecordingPresets: {
    HIGH_QUALITY: {},
  },
}));

// Mock expo-haptics
vi.mock("expo-haptics", () => ({
  impactAsync: vi.fn(() => Promise.resolve()),
  notificationAsync: vi.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

// Mock expo-router
vi.mock("expo-router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
  })),
}));
