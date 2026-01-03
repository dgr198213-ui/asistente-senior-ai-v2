import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { calculateWellnessStreak, getRandomMemoryExercise } from "@/lib/health-kit-service";

export default function WellnessScreen() {
  const colors = useColors();
  const [streak, setStreak] = useState(0);
  const [memoryExercise, setMemoryExercise] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWellnessData();
  }, []);

  const loadWellnessData = async () => {
    try {
      const reminders = JSON.parse((await AsyncStorage.getItem("@asistente_senior_reminders")) || "[]");
      const healthMetrics = JSON.parse((await AsyncStorage.getItem("@asistente_senior_health")) || "[]");

      const completedReminders = reminders
        .filter((r: any) => r.completed)
        .map((r: any) => new Date(r.completedAt));
      const loggedMetrics = healthMetrics.map((m: any) => new Date(m.recordedAt));

      const { streak: currentStreak } = calculateWellnessStreak(completedReminders, loggedMetrics);
      setStreak(currentStreak);

      // Cargar ejercicio de memoria aleatorio
      setMemoryExercise(getRandomMemoryExercise());
    } catch (error) {
      console.error("Error loading wellness data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMemoryExercise(getRandomMemoryExercise());
    setUserAnswer("");
    setShowAnswer(false);
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Título */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground">Bienestar</Text>
          <Text className="text-base text-muted mt-1">Mantén tu mente y cuerpo activos</Text>
        </View>

        {/* Racha de Bienestar */}
        <View className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-6 mb-6 shadow-lg">
          <View className="items-center">
            <Text className="text-6xl font-bold text-white mb-2">{streak}</Text>
            <Text className="text-xl text-white font-semibold">Días de Racha</Text>
            <Text className="text-sm text-blue-100 mt-2">¡Sigue así! Estás haciendo un excelente trabajo</Text>
          </View>
        </View>

        {/* Estadísticas */}
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row items-center mb-2">
              <IconSymbol size={20} name="checkmark.circle.fill" color={colors.success} />
              <Text className="text-xs text-muted ml-2">Recordatorios</Text>
            </View>
            <Text className="text-2xl font-bold text-foreground">8/10</Text>
            <Text className="text-xs text-muted mt-1">Completados hoy</Text>
          </View>

          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row items-center mb-2">
              <IconSymbol size={20} name="heart.fill" color={colors.error} />
              <Text className="text-xs text-muted ml-2">Salud</Text>
            </View>
            <Text className="text-2xl font-bold text-foreground">3/7</Text>
            <Text className="text-xs text-muted mt-1">Mediciones esta semana</Text>
          </View>
        </View>

        {/* Ejercicio de Memoria */}
        <View className="bg-surface rounded-3xl p-6 border border-border mb-6">
          <View className="flex-row items-center mb-4">
            <IconSymbol size={24} name="brain" color={colors.primary} />
            <Text className="text-xl font-bold text-foreground ml-3">Ejercicio de Memoria</Text>
          </View>

          {memoryExercise && (
            <View>
              <View className="bg-primary bg-opacity-10 rounded-2xl p-4 mb-4">
                <Text className="text-lg text-foreground font-semibold">{memoryExercise.question}</Text>
              </View>

              {!showAnswer ? (
                <View className="gap-3">
                  <Pressable
                    onPress={() => setShowAnswer(true)}
                    style={({ pressed }) => ({
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      opacity: pressed ? 0.8 : 1,
                    })}
                    className="bg-primary rounded-xl py-3 items-center"
                  >
                    <Text className="text-white font-semibold">Mostrar Respuesta</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleNewExercise}
                    style={({ pressed }) => ({
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      opacity: pressed ? 0.8 : 1,
                    })}
                    className="bg-surface border border-border rounded-xl py-3 items-center"
                  >
                    <Text className="text-foreground font-semibold">Otra Pregunta</Text>
                  </Pressable>
                </View>
              ) : (
                <View className="gap-3">
                  <View className="bg-success bg-opacity-10 rounded-2xl p-4">
                    <Text className="text-base text-foreground">
                      Esta pregunta te ayuda a mantener tu memoria activa. Recuerda que es normal olvidar detalles con el tiempo.
                    </Text>
                  </View>

                  <Pressable
                    onPress={handleNewExercise}
                    style={({ pressed }) => ({
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      opacity: pressed ? 0.8 : 1,
                    })}
                    className="bg-primary rounded-xl py-3 items-center"
                  >
                    <Text className="text-white font-semibold">Siguiente Pregunta</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Consejos de Bienestar */}
        <View className="bg-surface rounded-3xl p-6 border border-border">
          <View className="flex-row items-center mb-4">
            <IconSymbol size={24} name="lightbulb.fill" color={colors.warning} />
            <Text className="text-xl font-bold text-foreground ml-3">Consejos Diarios</Text>
          </View>

          <View className="gap-3">
            <View className="flex-row gap-3">
              <View className="w-1 bg-primary rounded-full" />
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Mantén la Actividad</Text>
                <Text className="text-sm text-muted mt-1">Camina al menos 30 minutos al día para mantener tu salud cardiovascular.</Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="w-1 bg-primary rounded-full" />
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Duerme Bien</Text>
                <Text className="text-sm text-muted mt-1">7-8 horas de sueño son esenciales para tu bienestar mental y físico.</Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="w-1 bg-primary rounded-full" />
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Conecta Socialmente</Text>
                <Text className="text-sm text-muted mt-1">Habla con amigos y familia regularmente para mantener tu mente activa.</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
