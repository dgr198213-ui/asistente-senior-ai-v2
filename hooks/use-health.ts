import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type HealthMetricType = "blood_pressure" | "glucose" | "weight" | "heart_rate";

export type HealthMetric = {
  id: string;
  type: HealthMetricType;
  value: string; // For blood_pressure: "120/80", for others: numeric string
  date: string;
  time: string;
  notes?: string;
  recordedAt?: string;
};

const HEALTH_STORAGE_KEY = "@asistente_senior_health";

export function useHealth() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load health metrics from AsyncStorage
  const loadMetrics = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(HEALTH_STORAGE_KEY);
      if (stored) {
        setMetrics(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load health metrics:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save metrics to AsyncStorage
  const saveMetrics = useCallback(async (newMetrics: HealthMetric[]) => {
    try {
      await AsyncStorage.setItem(HEALTH_STORAGE_KEY, JSON.stringify(newMetrics));
      setMetrics(newMetrics);
    } catch (error) {
      console.error("Failed to save health metrics:", error);
    }
  }, []);

  // Add new metric
  const addMetric = useCallback(
    async (metric: Omit<HealthMetric, "id">) => {
      const newMetric: HealthMetric = {
        ...metric,
        id: Date.now().toString(),
        recordedAt: new Date().toISOString(),
      };
      const updated = [newMetric, ...metrics];
      await saveMetrics(updated);
    },
    [metrics, saveMetrics]
  );

  // Delete metric
  const deleteMetric = useCallback(
    async (id: string) => {
      const updated = metrics.filter((m) => m.id !== id);
      await saveMetrics(updated);
    },
    [metrics, saveMetrics]
  );

  // Get latest metric by type
  const getLatestMetric = useCallback(
    (type: HealthMetricType): HealthMetric | null => {
      const filtered = metrics.filter((m) => m.type === type);
      if (filtered.length === 0) return null;
      return filtered[0]; // Already sorted by newest first
    },
    [metrics]
  );

  // Get metrics by type for last N days
  const getMetricsByType = useCallback(
    (type: HealthMetricType, days: number = 7): HealthMetric[] => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffStr = cutoffDate.toISOString().split("T")[0];

      return metrics
        .filter((m) => m.type === type && m.date >= cutoffStr)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    },
    [metrics]
  );

  // Check if value is in normal range
  const isValueNormal = useCallback((type: HealthMetricType, value: string): boolean => {
    switch (type) {
      case "blood_pressure": {
        const [systolic, diastolic] = value.split("/").map(Number);
        return systolic >= 90 && systolic <= 140 && diastolic >= 60 && diastolic <= 90;
      }
      case "glucose": {
        const glucose = Number(value);
        return glucose >= 70 && glucose <= 140;
      }
      case "weight": {
        // Weight is subjective, always return true
        return true;
      }
      case "heart_rate": {
        const hr = Number(value);
        return hr >= 60 && hr <= 100;
      }
      default:
        return true;
    }
  }, []);

  // Get metric label
  const getMetricLabel = useCallback((type: HealthMetricType): string => {
    switch (type) {
      case "blood_pressure":
        return "Presión Arterial";
      case "glucose":
        return "Glucosa";
      case "weight":
        return "Peso";
      case "heart_rate":
        return "Frecuencia Cardíaca";
      default:
        return type;
    }
  }, []);

  // Get metric unit
  const getMetricUnit = useCallback((type: HealthMetricType): string => {
    switch (type) {
      case "blood_pressure":
        return "mmHg";
      case "glucose":
        return "mg/dL";
      case "weight":
        return "kg";
      case "heart_rate":
        return "bpm";
      default:
        return "";
    }
  }, []);

  // Load metrics on mount
  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    isLoading,
    addMetric,
    deleteMetric,
    getLatestMetric,
    getMetricsByType,
    isValueNormal,
    getMetricLabel,
    getMetricUnit,
  };
}
