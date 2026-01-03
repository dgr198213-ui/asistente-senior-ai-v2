import { useRouter } from "expo-router";
import { useCallback } from "react";
import * as Speech from "expo-speech";

// Mapeo de comandos de voz a rutas
const VOICE_COMMANDS = {
  // Navegación
  "ir a inicio": "/",
  "ir a home": "/",
  "inicio": "/",
  "home": "/",
  "ir a asistente": "/(tabs)/assistant",
  "asistente": "/(tabs)/assistant",
  "ir a recordatorios": "/(tabs)/reminders",
  "recordatorios": "/(tabs)/reminders",
  "ir a salud": "/(tabs)/health",
  "salud": "/(tabs)/health",
  "ir a contactos": "/emergency-contacts",
  "contactos": "/emergency-contacts",
  "ir a emergencia": "/(tabs)/emergency-enhanced",
  "emergencia": "/(tabs)/emergency-enhanced",
  "ir a configuración": "/settings",
  "configuración": "/settings",
  "ajustes": "/settings",

  // Acciones
  "llamar al 911": "emergency_call",
  "llamar emergencia": "emergency_call",
  "ayuda": "emergency_call",
  "crear recordatorio": "create_reminder",
  "agregar medicamento": "add_medication",
  "registrar salud": "add_health",
  "agregar contacto": "add_contact",
  "limpiar historial": "clear_history",
};

// Tipos de acciones
export type VoiceAction = "navigate" | "action" | "unknown";

export interface VoiceCommand {
  command: string;
  action: VoiceAction;
  target?: string;
}

export function useVoiceNavigation() {
  const router = useRouter();

  const parseVoiceCommand = useCallback((text: string): VoiceCommand => {
    const lowerText = text.toLowerCase().trim();

    // Buscar coincidencia exacta
    for (const [command, target] of Object.entries(VOICE_COMMANDS)) {
      if (lowerText === command) {
        const action = target.startsWith("/") ? "navigate" : "action";
        return { command, action, target };
      }
    }

    // Buscar coincidencia parcial
    for (const [command, target] of Object.entries(VOICE_COMMANDS)) {
      if (lowerText.includes(command)) {
        const action = target.startsWith("/") ? "navigate" : "action";
        return { command, action, target };
      }
    }

    return { command: lowerText, action: "unknown" };
  }, []);

  const executeVoiceCommand = useCallback(
    async (voiceCommand: VoiceCommand) => {
      try {
        if (voiceCommand.action === "navigate" && voiceCommand.target) {
          router.push(voiceCommand.target as any);
          await Speech.speak("Navegando...", { language: "es-ES" });
        } else if (voiceCommand.action === "action") {
          // Las acciones se manejan en el componente que llama a esta función
          return voiceCommand.target;
        } else {
          await Speech.speak(
            "No entendí ese comando. Puedes decir: ir a inicio, ir a asistente, ir a recordatorios, o ir a emergencia.",
            { language: "es-ES" }
          );
        }
      } catch (error) {
        console.error("Error executing voice command:", error);
        await Speech.speak("Hubo un error al ejecutar el comando.", { language: "es-ES" });
      }
    },
    [router]
  );

  const processVoiceInput = useCallback(
    async (text: string) => {
      const command = parseVoiceCommand(text);
      await executeVoiceCommand(command);
      return command;
    },
    [parseVoiceCommand, executeVoiceCommand]
  );

  return {
    parseVoiceCommand,
    executeVoiceCommand,
    processVoiceInput,
  };
}
