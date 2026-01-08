import { vi } from "vitest";

// Mock AsyncStorage
const storage: Record<string, string> = {};
const mockAsyncStorage = {
  getItem: vi.fn((key: string) => Promise.resolve(storage[key] || null)),
  setItem: vi.fn((key: string, value: string) => {
    storage[key] = value;
    return Promise.resolve();
  }),
  removeItem: vi.fn((key: string) => {
    delete storage[key];
    return Promise.resolve();
  }),
  clear: vi.fn(() => {
    Object.keys(storage).forEach((key) => delete storage[key]);
    return Promise.resolve();
  }),
  getAllKeys: vi.fn(() => Promise.resolve(Object.keys(storage))),
  multiGet: vi.fn((keys: string[]) => Promise.resolve(keys.map((key) => [key, storage[key] || null]))),
  multiSet: vi.fn((pairs: [string, string][]) => {
    pairs.forEach(([key, value]) => (storage[key] = value));
    return Promise.resolve();
  }),
  multiRemove: vi.fn((keys: string[]) => {
    keys.forEach((key) => delete storage[key]);
    return Promise.resolve();
  }),
};

vi.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
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
