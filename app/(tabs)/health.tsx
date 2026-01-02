import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useHealth } from "@/hooks/use-health";

export default function HealthScreen() {
  const colors = useColors();
  const { getLatestMetric, isLoading } = useHealth();

  const bloodPressure = getLatestMetric("blood_pressure");
  const glucose = getLatestMetric("glucose");

  if (isLoading) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1">
        <Text className="text-3xl font-bold text-foreground mb-6">Salud</Text>
        <ScrollView className="flex-1">
          <View className="gap-4">
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <View className="flex-row items-center gap-3 mb-3">
                <IconSymbol size={32} name="heart.fill" color={colors.error} />
                <Text className="text-xl font-semibold text-foreground">Presión Arterial</Text>
              </View>
              <Text className="text-3xl font-bold text-foreground">
                {bloodPressure ? `${bloodPressure.value} mmHg` : "Sin datos"}
              </Text>
              <Text className="text-base text-muted mt-1">
                {bloodPressure ? `Última medición: ${bloodPressure.date}` : "No hay mediciones"}
              </Text>
            </View>

            <View className="bg-surface rounded-2xl p-6 border border-border">
              <View className="flex-row items-center gap-3 mb-3">
                <IconSymbol size={32} name="pill.fill" color={colors.primary} />
                <Text className="text-xl font-semibold text-foreground">Glucosa</Text>
              </View>
              <Text className="text-3xl font-bold text-foreground">
                {glucose ? `${glucose.value} mg/dL` : "Sin datos"}
              </Text>
              <Text className="text-base text-muted mt-1">
                {glucose ? `Última medición: ${glucose.date}` : "No hay mediciones"}
              </Text>
            </View>
          </View>
        </ScrollView>
        <Pressable
          style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
          className="bg-primary rounded-full p-5 items-center mt-6"
        >
          <View className="flex-row items-center gap-2">
            <IconSymbol size={24} name="plus.circle.fill" color="#ffffff" />
            <Text className="text-white text-xl font-bold">Agregar Medición</Text>
          </View>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
