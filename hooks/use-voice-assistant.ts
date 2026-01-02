import { useState, useCallback } from "react";
import { Platform } from "react-native";
import { useAudioRecorder, RecordingPresets } from "expo-audio";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

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

  // Create audio recorder with high quality preset
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const startRecording = useCallback(async () => {
    try {
      // Prepare and start recording
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }, [recorder]);

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

      // For now, use a placeholder transcription
      // TODO: Implement actual speech-to-text using server API
      const transcription = "Hola, ¿cómo estás?";

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: transcription,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Get AI response (placeholder)
      // TODO: Replace with actual API call to server
      const response = {
        message: "Estoy muy bien, gracias por preguntar. ¿En qué puedo ayudarte hoy?",
      };

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // TODO: Implement text-to-speech for the response
      setIsProcessing(false);
    } catch (error) {
      console.error("Failed to process recording:", error);
      setIsProcessing(false);
    }
  }, [recorder, messages]);

  const sendTextMessage = useCallback(
    async (text: string) => {
      setIsProcessing(true);

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Get AI response (placeholder)
        // TODO: Replace with actual API call to server
        const response = {
          message: "Entiendo tu pregunta. Estoy aquí para ayudarte con lo que necesites.",
        };

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
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }

      setIsProcessing(false);
    },
    [messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "¡Hola! Soy tu asistente personal. Puedes preguntarme lo que necesites o pedirme que te ayude con tus recordatorios, salud y más.",
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    messages,
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    sendTextMessage,
    clearMessages,
  };
}
