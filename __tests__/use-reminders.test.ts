import { describe, it, expect, beforeEach } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";

describe("Reminders Hook", () => {
  beforeEach(async () => {
    // Clear AsyncStorage before each test
    await AsyncStorage.clear();
  });

  it("should initialize with empty reminders", async () => {
    const stored = await AsyncStorage.getItem("@asistente_senior_reminders");
    expect(stored).toBeNull();
  });

  it("should save and retrieve reminders from AsyncStorage", async () => {
    const testReminders = [
      {
        id: "1",
        title: "Tomar medicamento",
        time: "09:00",
        date: "2026-01-02",
        type: "medication" as const,
        completed: false,
      },
    ];

    await AsyncStorage.setItem("@asistente_senior_reminders", JSON.stringify(testReminders));
    const stored = await AsyncStorage.getItem("@asistente_senior_reminders");
    const parsed = JSON.parse(stored || "[]");

    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe("Tomar medicamento");
    expect(parsed[0].type).toBe("medication");
  });

  it("should handle multiple reminders", async () => {
    const testReminders = [
      {
        id: "1",
        title: "Tomar medicamento",
        time: "09:00",
        date: "2026-01-02",
        type: "medication" as const,
        completed: false,
      },
      {
        id: "2",
        title: "Cita con el doctor",
        time: "14:30",
        date: "2026-01-03",
        type: "appointment" as const,
        completed: false,
      },
    ];

    await AsyncStorage.setItem("@asistente_senior_reminders", JSON.stringify(testReminders));
    const stored = await AsyncStorage.getItem("@asistente_senior_reminders");
    const parsed = JSON.parse(stored || "[]");

    expect(parsed).toHaveLength(2);
    expect(parsed[1].title).toBe("Cita con el doctor");
  });

  it("should filter completed reminders", async () => {
    const testReminders = [
      {
        id: "1",
        title: "Tomar medicamento",
        time: "09:00",
        date: "2026-01-02",
        type: "medication" as const,
        completed: true,
      },
      {
        id: "2",
        title: "Llamar a María",
        time: "16:00",
        date: "2026-01-02",
        type: "general" as const,
        completed: false,
      },
    ];

    await AsyncStorage.setItem("@asistente_senior_reminders", JSON.stringify(testReminders));
    const stored = await AsyncStorage.getItem("@asistente_senior_reminders");
    const parsed = JSON.parse(stored || "[]");
    const pending = parsed.filter((r: any) => !r.completed);

    expect(pending).toHaveLength(1);
    expect(pending[0].title).toBe("Llamar a María");
  });
});
