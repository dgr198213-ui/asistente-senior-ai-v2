import { useState, useCallback, useEffect } from "react";
import { Platform, Alert } from "react-native";
import { useAudioRecorder, RecordingPresets } from "expo-audio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { trpc } from "@/lib/trpc";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const MESSAGES_STORAGE_KEY = "@asistente_senior_messages";
const MAX_STORED_MESSAGES = 50;

export function useVoiceAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente personal. Puedes preguntarme lo que necesites o pedirme que te ayude con tus recordatorios, salud y más.",
      timestamp: new Date(),
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAudioPermission, setHasAudioPermission] = useState(false);

  // Create audio recorder with high quality preset
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // tRPC mutation para enviar mensajes
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  // Solicitar permisos de audio al montar el componente
  useEffect(() => {
    requestAudioPermissions();
    loadMessages();
  }, []);

  // Guardar mensajes cuando cambien
  useEffect(() => {
    saveMessages();
  }, [messages]);

  const requestAudioPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasAudioPermission(status === "granted");
      
      if (status !== "granted") {
        Alert.alert(
          "Permisos necesarios",
          "Esta aplicación necesita acceso al micrófono para grabar tu voz. Por favor, habilita los permisos en la configuración.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error requesting audio permissions:", error);
      setHasAudioPermission(false);
    }
  };

  const loadMessages = async () => {
    try {
      const stored = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir timestamps de string a Date
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const saveMessages = async () => {
    try {
      // Guardar solo los últimos MAX_STORED_MESSAGES mensajes
      const messagesToSave = messages.slice(-MAX_STORED_MESSAGES);
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error("Error saving messages:", error);
    }
  };

  const startRecording = useCallback(async () => {
    if (!hasAudioPermission) {
      Alert.alert(
        "Permisos necesarios",
        "Necesitas habilitar los permisos de micrófono para usar esta función.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      // Prepare and start recording
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "No se pudo iniciar la grabación. Por favor, intenta de nuevo.");
    }
  }, [recorder, hasAudioPermission]);

  const stopRecording = useCallback(async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);

      // Stop recording
      await recorder.stop();
      const uri = recorder.uri;

      if (!uri) {
        setIsProcessing(false);
        return;
      }

      // Por ahora, usamos una transcripción placeholder
      // TODO: Implementar transcripción real con un servicio de Speech-to-Text
      const transcription = "Mensaje de voz (transcripción pendiente de implementar)";

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: transcription,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Enviar mensaje al servidor
      await sendTextMessage(transcription);
    } catch (error) {
      console.error("Failed to process recording:", error);
      Alert.alert("Error", "No se pudo procesar la grabación. Por favor, intenta de nuevo.");
      setIsProcessing(false);
    }
  }, [recorder]);

  const sendTextMessage = useCallback(
    async (text: string) => {
      setIsProcessing(true);

      // Add user message si no se agregó antes
      const existingMessage = messages.find(
        (m) => m.content === text && m.role === "user" && Date.now() - m.timestamp.getTime() < 1000
      );

      if (!existingMessage) {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
      }

      try {
        // Preparar historial de conversación para contexto
        const conversationHistory = messages.slice(-10).map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // Llamar al servidor
        const response = await sendMessageMutation.mutateAsync({
          message: text,
          conversationHistory,
        });

        // Add assistant message
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Failed to get AI response:", error);
        
        // Mensaje de error amigable
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Lo siento, tuve un problema al procesar tu mensaje. Por favor, intenta de nuevo.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }

      setIsProcessing(false);
    },
    [messages, sendMessageMutation]
  );

  const clearMessages = useCallback(async () => {
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente personal. Puedes preguntarme lo que necesites o pedirme que te ayude con tus recordatorios, salud y más.",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    
    try {
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([welcomeMessage]));
    } catch (error) {
      console.error("Error clearing messages:", error);
    }
  }, []);

  return {
    messages,
    isRecording,
    isProcessing,
    hasAudioPermission,
    startRecording,
    stopRecording,
    sendTextMessage,
    clearMessages,
  };
}
