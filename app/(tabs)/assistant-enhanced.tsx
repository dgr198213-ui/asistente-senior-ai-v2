import { ScrollView, Text, View, Pressable, TextInput, Platform, KeyboardAvoidingView, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useVoiceAssistant } from "@/hooks/use-voice-assistant";
import { useVoiceNavigation } from "@/hooks/use-voice-navigation";
import * as Haptics from "expo-haptics";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const QUICK_SUGGESTIONS = [
  "¿Cuándo tomar mi medicamento?",
  "¿Cómo agrego un recordatorio?",
  "Necesito ayuda de emergencia",
  "¿Cuál es mi presión arterial?",
  "¿Cómo registro mi salud?",
  "Ejercicio de respiración",
  "Cuéntame un chiste",
  "¿Qué hora es?",
];

export default function AssistantEnhancedScreen() {
  const colors = useColors();
  const { 
    messages, 
    isRecording, 
    isProcessing, 
    isTranscribing, 
    hasAudioPermission, 
    startRecording, 
    stopRecording, 
    sendTextMessage, 
    clearMessages,
    sentimentAnalysis 
  } = useVoiceAssistant();
  
  const { processVoiceInput, isListeningForCommands } = useVoiceNavigation();
  
  const [textInput, setTextInput] = useState("");
  const [showSentimentAlert, setShowSentimentAlert] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Monitorear análisis de sentimiento
  useEffect(() => {
    if (sentimentAnalysis?.requiresAlert && sentimentAnalysis.sentiment === "distressed") {
      setShowSentimentAlert(true);
      // Mostrar alerta después de 2 segundos
      setTimeout(() => {
        Alert.alert(
          "Nos preocupamos por ti",
          "Detectamos que podrías estar pasando por un momento difícil. ¿Te gustaría hacer un ejercicio de respiración?",
          [
            { text: "Sí, ayúdame", onPress: () => sendTextMessage("Ejercicio de respiración") },
            { text: "Estoy bien", onPress: () => setShowSentimentAlert(false) }
          ]
        );
      }, 1000);
    }
  }, [sentimentAnalysis]);

  const handleMicPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleVoiceNavigation = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      await processVoiceInput("asistente");
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar el comando de voz");
    }
  };

  const handleSendText = () => {
    if (textInput.trim().length === 0) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    sendTextMessage(textInput.trim());
    setTextInput("");
  };

  const handleQuickSuggestion = (suggestion: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    sendTextMessage(suggestion);
  };

  const handleClearHistory = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      "Limpiar historial",
      "¿Estás seguro de que deseas eliminar todo el historial de conversación?",
      [
        { text: "Cancelar", onPress: () => {} },
        { text: "Eliminar", onPress: () => clearMessages(), style: "destructive" }
      ]
    );
  };

  // Mostrar sugerencias solo si no hay mensajes (excepto el de bienvenida)
  const showSuggestions = messages.length <= 1;

  // Indicador de sentimiento
  const getSentimentColor = () => {
    if (!sentimentAnalysis) return colors.muted;
    switch (sentimentAnalysis.sentiment) {
      case "distressed":
        return colors.error;
      case "negative":
        return colors.warning;
      case "positive":
        return colors.success;
      default:
        return colors.muted;
    }
  };

  return (
    <ScreenContainer className="p-6">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }} 
        keyboardVerticalOffset={100}
      >
        <View className="flex-1">
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground">Asistente de Voz</Text>
              <Text className="text-base text-muted mt-1">
                {isTranscribing ? "Escuchando..." : isProcessing ? "Procesando..." : hasAudioPermission ? "Toca el micrófono o escribe" : "Escribe tu mensaje"}
              </Text>
            </View>
            <Pressable
              onPress={handleClearHistory}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="ml-4"
            >
              <IconSymbol size={28} name="trash.fill" color={colors.muted} />
            </Pressable>
          </View>

          {/* Indicador de Sentimiento */}
          {sentimentAnalysis && (
            <View 
              className={cn(
                "mb-4 p-3 rounded-lg flex-row items-center gap-2",
                sentimentAnalysis.sentiment === "distressed" && "bg-red-100",
                sentimentAnalysis.sentiment === "negative" && "bg-yellow-100",
                sentimentAnalysis.sentiment === "positive" && "bg-green-100",
                sentimentAnalysis.sentiment === "neutral" && "bg-gray-100"
              )}
            >
              <View 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getSentimentColor() }}
              />
              <Text className="text-sm font-medium text-foreground flex-1">
                {sentimentAnalysis.sentiment === "distressed" && "Pareces estar pasando por un momento difícil"}
                {sentimentAnalysis.sentiment === "negative" && "Detectamos algo negativo en tu mensaje"}
                {sentimentAnalysis.sentiment === "positive" && "¡Qué bueno escucharte así!"}
                {sentimentAnalysis.sentiment === "neutral" && "Conversación normal"}
              </Text>
            </View>
          )}

          {/* Mensajes */}
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1 mb-4 bg-surface rounded-xl p-4"
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <View className="items-center justify-center py-12">
                <IconSymbol size={48} name="mic.fill" color={colors.primary} />
                <Text className="text-lg font-semibold text-foreground mt-4">Bienvenido al Asistente</Text>
                <Text className="text-base text-muted text-center mt-2">
                  Puedo ayudarte con medicamentos, salud, recordatorios y mucho más
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {messages.map((msg, idx) => (
                  <View
                    key={idx}
                    className={cn(
                      "max-w-xs rounded-lg p-3",
                      msg.role === "user"
                        ? "self-end bg-primary"
                        : "self-start bg-background border border-border"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-base leading-relaxed",
                        msg.role === "user" ? "text-background" : "text-foreground"
                      )}
                    >
                      {msg.content}
                    </Text>
                  </View>
                ))}
                {isProcessing && (
                  <View className="self-start flex-row items-center gap-2 bg-background border border-border rounded-lg p-3">
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text className="text-base text-muted">Procesando...</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Sugerencias Rápidas */}
          {showSuggestions && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              <View className="flex-row gap-2">
                {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleQuickSuggestion(suggestion)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="bg-surface border border-border rounded-full px-4 py-2"
                  >
                    <Text className="text-sm font-medium text-foreground">{suggestion}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Entrada de Texto */}
          <View className="flex-row items-center gap-3 bg-surface rounded-xl p-3 border border-border">
            <TextInput
              value={textInput}
              onChangeText={setTextInput}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor={colors.muted}
              className="flex-1 text-base text-foreground"
              editable={!isProcessing}
              returnKeyType="send"
              onSubmitEditing={handleSendText}
            />
            <Pressable
              onPress={handleSendText}
              disabled={textInput.trim().length === 0 || isProcessing}
              style={({ pressed }) => [
                { opacity: pressed ? 0.7 : textInput.trim().length === 0 ? 0.5 : 1 }
              ]}
            >
              <IconSymbol 
                size={24} 
                name="paperplane.fill" 
                color={textInput.trim().length === 0 ? colors.muted : colors.primary}
              />
            </Pressable>
          </View>

          {/* Botones de Control */}
          <View className="flex-row gap-3 mt-4">
            {/* Micrófono */}
            <Pressable
              onPress={handleMicPress}
              disabled={!hasAudioPermission || isProcessing}
              style={({ pressed }) => [
                { 
                  opacity: pressed ? 0.7 : !hasAudioPermission || isProcessing ? 0.5 : 1,
                  flex: 1
                }
              ]}
              className={cn(
                "py-4 rounded-xl items-center justify-center",
                isRecording ? "bg-error" : "bg-primary"
              )}
            >
              <View className="flex-row items-center gap-2">
                <IconSymbol 
                  size={24} 
                  name={isRecording ? "mic.slash.fill" : "mic.fill"} 
                  color="white"
                />
                <Text className="text-white font-semibold">
                  {isRecording ? "Detener" : "Grabar"}
                </Text>
              </View>
            </Pressable>

            {/* Navegación por Voz */}
            <Pressable
              onPress={handleVoiceNavigation}
              disabled={isProcessing}
              style={({ pressed }) => [
                { 
                  opacity: pressed ? 0.7 : isProcessing ? 0.5 : 1,
                  flex: 1
                }
              ]}
              className={cn(
                "py-4 rounded-xl items-center justify-center border-2",
                isListeningForCommands ? "bg-primary border-primary" : "bg-background border-primary"
              )}
            >
              <View className="flex-row items-center gap-2">
                <IconSymbol 
                  size={24} 
                  name="waveform" 
                  color={isListeningForCommands ? "white" : colors.primary}
                />
                <Text className={cn(
                  "font-semibold",
                  isListeningForCommands ? "text-white" : "text-primary"
                )}>
                  Comandos
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Estado de Grabación */}
          {isTranscribing && (
            <View className="mt-4 bg-blue-100 rounded-lg p-3 flex-row items-center gap-2">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text className="text-sm text-foreground flex-1">Transcribiendo audio...</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
