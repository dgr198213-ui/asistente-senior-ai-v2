import { useState } from "react";
import { Text, View, Pressable, TextInput, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useHealth, type HealthMetricType } from "@/hooks/use-health";
import * as Haptics from "expo-haptics";

export default function AddHealthMetricScreen() {
  const colors = useColors();
  const router = useRouter();
  const { addMetric, getMetricLabel, getMetricUnit } = useHealth();

  const [type, setType] = useState<HealthMetricType>("blood_pressure");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!value.trim()) {
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const now = new Date();
    await addMetric({
      type,
      value: value.trim(),
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().split(" ")[0].substring(0, 5),
      notes: notes.trim() || undefined,
    });

    router.back();
  };

  const types: { value: HealthMetricType; label: string; icon: string; placeholder: string }[] = [
    { value: "blood_pressure", label: "Presión Arterial", icon: "heart.fill", placeholder: "120/80" },
    { value: "glucose", label: "Glucosa", icon: "pill.fill", placeholder: "95" },
    { value: "weight", label: "Peso", icon: "person.fill", placeholder: "70" },
    { value: "heart_rate", label: "Frecuencia Cardíaca", icon: "heart.fill", placeholder: "75" },
  ];

  const currentType = types.find((t) => t.value === type)!;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-6">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Pressable onPress={() => router.back()} className="p-2">
            <Text className="text-xl text-primary">Cancelar</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">Nueva Medición</Text>
          <View className="w-20" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Type Selection */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Tipo de Medición</Text>
            <View className="gap-3">
              {types.map((t) => (
                <Pressable
                  key={t.value}
                  onPress={() => {
                    setType(t.value);
                    setValue("");
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  className={`flex-row items-center gap-4 p-5 rounded-2xl border ${
                    type === t.value ? "bg-primary/10 border-primary" : "bg-surface border-border"
                  }`}
                >
                  <IconSymbol size={28} name={t.icon as any} color={type === t.value ? colors.primary : colors.muted} />
                  <Text
                    className={`text-xl font-semibold ${
                      type === t.value ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Value Input */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-2">
              Valor ({getMetricUnit(type)})
            </Text>
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder={currentType.placeholder}
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              className="bg-surface border border-border rounded-2xl p-5 text-xl text-foreground"
              style={{ fontSize: 20 }}
            />
            {type === "blood_pressure" && (
              <Text className="text-sm text-muted mt-2">Formato: Sistólica/Diastólica (ej: 120/80)</Text>
            )}
          </View>

          {/* Notes Input */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-2">Notas (opcional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Ej: Medición en ayunas"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              className="bg-surface border border-border rounded-2xl p-5 text-xl text-foreground"
              style={{ fontSize: 18, minHeight: 100, textAlignVertical: "top" }}
            />
          </View>

          {/* Info Card */}
          <View className="bg-primary/10 rounded-2xl p-5 border border-primary/30">
            <View className="flex-row items-start gap-3">
              <IconSymbol size={24} name="info.circle.fill" color={colors.primary} />
              <View className="flex-1">
                <Text className="text-base text-foreground leading-relaxed">
                  La medición se guardará con la fecha y hora actual. Puedes agregar notas para recordar
                  detalles importantes.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={!value.trim()}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.97 : 1 }],
            opacity: !value.trim() ? 0.5 : 1,
          })}
          className="bg-primary rounded-full p-5 items-center mt-4"
        >
          <Text className="text-white text-xl font-bold">Guardar Medición</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
