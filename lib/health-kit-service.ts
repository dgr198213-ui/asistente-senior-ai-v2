import { Accelerometer } from "expo-sensors";

// Tipos de datos de salud
export interface HealthData {
  steps: number;
  heartRate: number;
  sleep: number; // en horas
  caloriesBurned: number;
  distance: number; // en km
  activeMinutes: number;
  timestamp: Date;
}

// Configuración de sensores
export const SENSOR_CONFIG = {
  accelerometer: {
    updateInterval: 100, // ms
    threshold: 3, // g (aceleración para detectar caída)
  },
  heartRate: {
    updateInterval: 1000,
    normalRange: { min: 60, max: 100 },
  },
};

// Función para detectar caídas
export class FallDetector {
  private accelerometerData: number[] = [];
  private readonly BUFFER_SIZE = 10;
  private readonly FALL_THRESHOLD = 3; // g

  constructor() {
    this.setupAccelerometer();
  }

  private setupAccelerometer() {
    Accelerometer.setUpdateInterval(SENSOR_CONFIG.accelerometer.updateInterval);
    Accelerometer.addListener(({ x, y, z }: { x: number; y: number; z: number }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      this.accelerometerData.push(magnitude);

      if (this.accelerometerData.length > this.BUFFER_SIZE) {
        this.accelerometerData.shift();
      }

      // Detectar cambio brusco (posible caída)
      if (this.detectFall()) {
        this.onFallDetected();
      }
    });
  }

  private detectFall(): boolean {
    if (this.accelerometerData.length < this.BUFFER_SIZE) return false;

    const average = this.accelerometerData.reduce((a, b) => a + b) / this.accelerometerData.length;
    const variance = this.accelerometerData.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / this.BUFFER_SIZE;

    return variance > this.FALL_THRESHOLD;
  }

  private onFallDetected() {
    // Esto se manejará en el componente que use FallDetector
    console.log("Posible caída detectada");
  }

  cleanup() {
    Accelerometer.removeAllListeners();
  }
}

// Función para simular lectura de HealthKit (en iOS real, usaría HealthKit framework)
export async function getHealthKitData(): Promise<HealthData> {
  // En una aplicación real, esto leería de HealthKit en iOS o Google Health Connect en Android
  // Por ahora, retornamos datos simulados
  return {
    steps: Math.floor(Math.random() * 15000),
    heartRate: 60 + Math.floor(Math.random() * 40),
    sleep: 6 + Math.random() * 3,
    caloriesBurned: 1500 + Math.floor(Math.random() * 1000),
    distance: Math.random() * 10,
    activeMinutes: Math.floor(Math.random() * 120),
    timestamp: new Date(),
  };
}

// Función para verificar si los datos están en rango normal
export function isHealthDataNormal(data: HealthData): {
  isNormal: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (data.heartRate < 60 || data.heartRate > 100) {
    warnings.push(`Frecuencia cardíaca anormal: ${data.heartRate} bpm`);
  }

  if (data.sleep < 6) {
    warnings.push(`Poco sueño registrado: ${data.sleep.toFixed(1)} horas`);
  }

  if (data.activeMinutes < 30) {
    warnings.push(`Actividad baja: ${data.activeMinutes} minutos`);
  }

  return {
    isNormal: warnings.length === 0,
    warnings,
  };
}

// Función para procesar datos de medicamentos con OCR (simulado)
export async function processMedicineImage(imageUri: string): Promise<{
  medicineName: string;
  dosage: string;
  frequency: string;
}> {
  // En una aplicación real, esto usaría Google Vision API o similar
  // Por ahora, retornamos datos simulados
  return {
    medicineName: "Medicamento Detectado",
    dosage: "500mg",
    frequency: "Dos veces al día",
  };
}

// Función para calcular racha de bienestar
export function calculateWellnessStreak(
  completedReminders: Date[],
  healthMetricsLogged: Date[]
): {
  streak: number;
  lastDate: Date | null;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allDates = [...completedReminders, ...healthMetricsLogged].map((date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const uniqueDates = [...new Set(allDates.map((d) => d.getTime()))].sort((a, b) => b - a);

  let streak = 0;
  let currentDate = new Date(today);

  for (const dateTime of uniqueDates) {
    const date = new Date(dateTime);
    if (date.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    streak,
    lastDate: uniqueDates.length > 0 ? new Date(uniqueDates[0]) : null,
  };
}

// Función para sugerir ejercicios de memoria
export const MEMORY_EXERCISES = [
  {
    id: "1",
    question: "¿Cuál fue el nombre de tu primera mascota?",
    category: "personal",
  },
  {
    id: "2",
    question: "¿En qué año te casaste?",
    category: "personal",
  },
  {
    id: "3",
    question: "¿Cuál es tu comida favorita?",
    category: "preferences",
  },
  {
    id: "4",
    question: "¿Cuántos hermanos tienes?",
    category: "family",
  },
  {
    id: "5",
    question: "¿Cuál fue tu primer trabajo?",
    category: "career",
  },
  {
    id: "6",
    question: "¿Cuál es tu color favorito?",
    category: "preferences",
  },
  {
    id: "7",
    question: "¿En qué ciudad naciste?",
    category: "personal",
  },
  {
    id: "8",
    question: "¿Cuál fue tu película favorita?",
    category: "entertainment",
  },
];

export function getRandomMemoryExercise() {
  return MEMORY_EXERCISES[Math.floor(Math.random() * MEMORY_EXERCISES.length)];
}
