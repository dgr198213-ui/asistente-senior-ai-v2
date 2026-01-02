import { ScrollView, Text, View, Pressable, Platform, ActivityIndicator, TextInput, KeyboardAvoidingView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useVoiceAssistant } from "@/hooks/use-voice-assistant";
import * as Haptics from "expo-haptics";
import { useState, useRef, useEffect } from "react";

export default function AssistantScreen() {
  const colors = useColors();
  const { messages, isRecording, isProcessing, hasAudioPermission, startRecording, stopRecording, sendTextMessage, clearMessages } =
    useVoiceAssistant();
  const [textInput, setTextInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

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

  const handleSendText = () => {
    if (textInput.trim().length === 0) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    sendTextMessage(textInput.trim());
    setTextInput("");
  };

  const handleClearHistory = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    clearMessages();
  };

  return (
    <ScreenContainer className="p-6">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={100}>
        <View className="flex-1">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground">Asistente de Voz</Text>
              <Text className="text-base text-muted mt-1">
                {hasAudioPermission ? "Toca el micrófono o escribe" : "Escribe tu mensaje"}
              </Text>
            </View>
            <Pressable
              onPress={handleClearHistory}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              className="ml-2 p-2 bg-surface rounded-lg border border-border"
            >
              <IconSymbol size={20} name="trash" color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView
            ref={scrollViewRef}
            className="flex-1 mb-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {messages.map((message) => (
              <View key={message.id} className={`mb-4 ${message.role === "user" ? "items-end" : "items-start"}`}>
                <View
                  className={`max-w-[85%] rounded-2xl p-4 ${message.role === "user" ? "bg-primary" : "bg-surface border border-border"}`}
                >
                  <Text className={`text-lg leading-relaxed ${message.role === "user" ? "text-white" : "text-foreground"}`}>
                    {message.content}
                  </Text>
                </View>
                <Text className="text-xs text-muted mt-1 mx-2">
                  {message.timestamp.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            ))}

            {isProcessing && (
              <View className="items-center mb-4">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text className="text-base text-muted mt-2">Procesando tu mensaje...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input de texto */}
          <View className="mb-4 flex-row items-center gap-2">
            <View className="flex-1 bg-surface border border-border rounded-2xl px-4 py-3">
              <TextInput
                value={textInput}
                onChangeText={setTextInput}
                placeholder="Escribe tu mensaje..."
                placeholderTextColor={colors.muted}
                style={{ color: colors.foreground, fontSize: 16 }}
                multiline
                maxLength={500}
                editable={!isProcessing}
                onSubmitEditing={handleSendText}
              />
            </View>
            <Pressable
              onPress={handleSendText}
              disabled={isProcessing || textInput.trim().length === 0}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.95 : 1 }],
                opacity: isProcessing || textInput.trim().length === 0 ? 0.5 : 1,
              })}
              className="w-14 h-14 rounded-full items-center justify-center bg-primary shadow-lg"
            >
              <IconSymbol size={24} name="paperplane.fill" color="#ffffff" />
            </Pressable>
          </View>

          {/* Botón de micrófono */}
          {hasAudioPermission && (
            <View className="items-center pb-4">
              <Pressable
                onPress={handleMicPress}
                disabled={isProcessing}
                style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], opacity: isProcessing ? 0.5 : 1 })}
                className={`w-20 h-20 rounded-full items-center justify-center ${isRecording ? "bg-error" : "bg-primary"} shadow-lg`}
              >
                {isRecording ? <View className="w-6 h-6 bg-white rounded" /> : <IconSymbol size={40} name="mic.fill" color="#ffffff" />}
              </Pressable>

              <Text className="text-sm text-muted mt-3 text-center">
                {isRecording ? "Grabando... Toca para detener" : isProcessing ? "Procesando..." : "Toca para hablar"}
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
