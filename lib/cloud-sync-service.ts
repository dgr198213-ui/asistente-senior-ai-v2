import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipos para sincronización
export interface SyncStatus {
  lastSync: Date | null;
  isSyncing: boolean;
  pendingChanges: number;
  syncErrors: string[];
}

export interface CloudBackup {
  userId: string;
  timestamp: Date;
  data: {
    messages: any[];
    reminders: any[];
    healthMetrics: any[];
    emergencyContacts: any[];
    settings: any[];
  };
}

// Servicio de sincronización en la nube
export class CloudSyncService {
  private syncStatus: SyncStatus = {
    lastSync: null,
    isSyncing: false,
    pendingChanges: 0,
    syncErrors: [],
  };

  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos
  private syncTimer: ReturnType<typeof setInterval> | null = null;

  async initializeSync(userId: string) {
    // Iniciar sincronización periódica
    this.syncTimer = setInterval(() => {
      this.syncAllData(userId);
    }, this.SYNC_INTERVAL);

    // Sincronizar inmediatamente
    await this.syncAllData(userId);
  }

  async syncAllData(userId: string) {
    if (this.syncStatus.isSyncing) return;

    this.syncStatus.isSyncing = true;

    try {
      const backup: CloudBackup = {
        userId,
        timestamp: new Date(),
        data: {
          messages: JSON.parse((await AsyncStorage.getItem("@asistente_senior_messages")) || "[]"),
          reminders: JSON.parse((await AsyncStorage.getItem("@asistente_senior_reminders")) || "[]"),
          healthMetrics: JSON.parse((await AsyncStorage.getItem("@asistente_senior_health_metrics")) || "[]"),
          emergencyContacts: JSON.parse((await AsyncStorage.getItem("@asistente_senior_emergency_contacts")) || "[]"),
          settings: JSON.parse((await AsyncStorage.getItem("@asistente_senior_settings")) || "{}"),
        },
      };

      // Enviar al servidor (en una app real, esto iría a un backend)
      await this.uploadBackup(backup);

      this.syncStatus.lastSync = new Date();
      this.syncStatus.pendingChanges = 0;
      this.syncStatus.syncErrors = [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      this.syncStatus.syncErrors.push(errorMessage);
      console.error("Error during sync:", error);
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }

  private async uploadBackup(backup: CloudBackup) {
    // En una aplicación real, esto enviaría a un servidor
    // Por ahora, simulamos el envío
    console.log("Backup enviado a la nube:", backup);

    // Simular envío exitoso
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  }

  async restoreFromBackup(backup: CloudBackup) {
    try {
      await AsyncStorage.setItem("@asistente_senior_messages", JSON.stringify(backup.data.messages));
      await AsyncStorage.setItem("@asistente_senior_reminders", JSON.stringify(backup.data.reminders));
      await AsyncStorage.setItem("@asistente_senior_health_metrics", JSON.stringify(backup.data.healthMetrics));
      await AsyncStorage.setItem("@asistente_senior_emergency_contacts", JSON.stringify(backup.data.emergencyContacts));
      await AsyncStorage.setItem("@asistente_senior_settings", JSON.stringify(backup.data.settings));

      console.log("Datos restaurados desde backup");
    } catch (error) {
      console.error("Error restoring backup:", error);
      throw error;
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  async manualSync(userId: string) {
    await this.syncAllData(userId);
  }

  cleanup() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
  }
}

// Servicio para alertas pasivas
export class PassiveAlertService {
  private readonly INACTIVITY_THRESHOLD = 24 * 60 * 60 * 1000; // 24 horas
  private checkTimer: ReturnType<typeof setInterval> | null = null;

  async initializeAlerts(userId: string, emergencyContacts: any[]) {
    this.checkTimer = setInterval(() => {
      this.checkInactivity(userId, emergencyContacts);
    }, 60 * 60 * 1000); // Verificar cada hora
  }

  private async checkInactivity(userId: string, emergencyContacts: any[]) {
    try {
      const messages = JSON.parse((await AsyncStorage.getItem("@asistente_senior_messages")) || "[]");
      const reminders = JSON.parse((await AsyncStorage.getItem("@asistente_senior_reminders")) || "[]");

      const lastMessageTime = messages.length > 0 ? new Date(messages[messages.length - 1].timestamp).getTime() : 0;
      const now = Date.now();

      if (now - lastMessageTime > this.INACTIVITY_THRESHOLD) {
        await this.alertEmergencyContacts(userId, emergencyContacts, "inactivity");
      }

      // Verificar medicamentos no marcados
      const incompletedReminders = reminders.filter((r: any) => !r.completed && r.category === "medicamento");
      if (incompletedReminders.length > 0) {
        const overdue = incompletedReminders.filter((r: any) => new Date(r.dueDate) < new Date());
        if (overdue.length > 0) {
          await this.alertEmergencyContacts(userId, emergencyContacts, "missed_medication");
        }
      }
    } catch (error) {
      console.error("Error checking inactivity:", error);
    }
  }

  private async alertEmergencyContacts(userId: string, contacts: any[], alertType: string) {
    // En una aplicación real, esto enviaría notificaciones a los contactos
    console.log(`Alerta enviada a contactos de emergencia: ${alertType}`);

    // Aquí iría la lógica para enviar emails, SMS o notificaciones push
    for (const contact of contacts) {
      console.log(`Notificando a ${contact.name} (${contact.phone})`);
    }
  }

  cleanup() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
  }
}
