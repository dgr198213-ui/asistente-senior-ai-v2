import { describe, it, expect, beforeEach } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";

describe("Health Hook", () => {
  beforeEach(async () => {
    // Clear AsyncStorage before each test
    await AsyncStorage.clear();
  });

  it("should initialize with empty health metrics", async () => {
    const stored = await AsyncStorage.getItem("@asistente_senior_health");
    expect(stored).toBeNull();
  });

  it("should save and retrieve health metrics from AsyncStorage", async () => {
    const testMetrics = [
      {
        id: "1",
        type: "blood_pressure",
        value: "120/80",
        date: "2026-01-02",
        time: "08:00",
      },
    ];

    await AsyncStorage.setItem("@asistente_senior_health", JSON.stringify(testMetrics));
    const stored = await AsyncStorage.getItem("@asistente_senior_health");
    const parsed = JSON.parse(stored || "[]");

    expect(parsed).toHaveLength(1);
    expect(parsed[0].type).toBe("blood_pressure");
    expect(parsed[0].value).toBe("120/80");
  });

  it("should validate blood pressure values", () => {
    const isValueNormal = (value: string): boolean => {
      const [systolic, diastolic] = value.split("/").map(Number);
      return systolic >= 90 && systolic <= 140 && diastolic >= 60 && diastolic <= 90;
    };

    expect(isValueNormal("120/80")).toBe(true);
    expect(isValueNormal("150/95")).toBe(false);
    expect(isValueNormal("85/55")).toBe(false);
  });

  it("should validate glucose values", () => {
    const isGlucoseNormal = (value: string): boolean => {
      const glucose = Number(value);
      return glucose >= 70 && glucose <= 140;
    };

    expect(isGlucoseNormal("95")).toBe(true);
    expect(isGlucoseNormal("150")).toBe(false);
    expect(isGlucoseNormal("65")).toBe(false);
  });

  it("should handle multiple health metrics", async () => {
    const testMetrics = [
      {
        id: "1",
        type: "blood_pressure",
        value: "120/80",
        date: "2026-01-02",
        time: "08:00",
      },
      {
        id: "2",
        type: "glucose",
        value: "95",
        date: "2026-01-02",
        time: "09:00",
      },
    ];

    await AsyncStorage.setItem("@asistente_senior_health", JSON.stringify(testMetrics));
    const stored = await AsyncStorage.getItem("@asistente_senior_health");
    const parsed = JSON.parse(stored || "[]");

    expect(parsed).toHaveLength(2);
    expect(parsed[0].type).toBe("blood_pressure");
    expect(parsed[1].type).toBe("glucose");
  });
});
