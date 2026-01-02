import { ScrollView, Text, View, Pressable, Platform, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useVoiceAssistant } from "@/hooks/use-voice-assistant";
import * as Haptics from "expo-haptics";

export default function AssistantScreen() {
  const colors = useColors();
  const { messages, isRecording, isProcessing, startRecording, stopRecording } = useVoiceAssistant();

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

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Asistente de Voz</Text>
          <Text className="text-base text-muted mt-1">Toca el micrófono para hablar</Text>
        </View>

        <ScrollView className="flex-1 mb-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {messages.map((message) => (
            <View key={message.id} className={`mb-4 ${message.role === "user" ? "items-end" : "items-start"}`}>
              <View className={`max-w-[85%] rounded-2xl p-4 ${message.role === "user" ? "bg-primary" : "bg-surface border border-border"}`}>
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

        <View className="items-center pb-4">
          <Pressable
            onPress={handleMicPress}
            disabled={isProcessing}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], opacity: isProcessing ? 0.5 : 1 })}
            className={`w-24 h-24 rounded-full items-center justify-center ${isRecording ? "bg-error" : "bg-primary"} shadow-lg`}
          >
            {isRecording ? (
              <View className="w-8 h-8 bg-white rounded" />
            ) : (
              <IconSymbol size={48} name="mic.fill" color="#ffffff" />
            )}
          </Pressable>

          <Text className="text-base text-muted mt-4 text-center">
            {isRecording ? "Grabando... Toca para detener" : isProcessing ? "Procesando..." : "Toca para hablar"}
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
