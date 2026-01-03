import { useState } from "react";
import { Text, View, Pressable, TextInput, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useReminders, type ReminderType } from "@/hooks/use-reminders";
import * as Haptics from "expo-haptics";

export default function AddReminderScreen() {
  const colors = useColors();
  const router = useRouter();
  const { addReminder } = useReminders();

  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<ReminderType>("general");
  const [repeat, setRepeat] = useState<"daily" | "weekly" | "none">("none");

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await addReminder({
      title: title.trim(),
      time,
      date,
      type,
      repeat,
    });

    router.back();
  };

  const types: { value: ReminderType; label: string; icon: string }[] = [
    { value: "medication", label: "Medicamento", icon: "pill.fill" },
    { value: "appointment", label: "Cita Médica", icon: "calendar" },
    { value: "general", label: "General", icon: "bell.fill" },
  ];

  const repeats: { value: "daily" | "weekly" | "none"; label: string }[] = [
    { value: "none", label: "No repetir" },
    { value: "daily", label: "Diariamente" },
    { value: "weekly", label: "Semanalmente" },
  ];

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-6">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Pressable onPress={() => router.push("/(tabs)/reminders")} className="p-2">
            <Text className="text-xl text-primary">Cancelar</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">Nuevo Recordatorio</Text>
          <View className="w-20" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-2">Título</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ej: Tomar medicamento"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-2xl p-5 text-xl text-foreground"
              style={{ fontSize: 20 }}
            />
          </View>

          {/* Type Selection */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Tipo</Text>
            <View className="gap-3">
              {types.map((t) => (
                <Pressable
                  key={t.value}
                  onPress={() => {
                    setType(t.value);
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

          {/* Time Input */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-2">Hora</Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="09:00"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-2xl p-5 text-xl text-foreground"
              style={{ fontSize: 20 }}
            />
            <Text className="text-sm text-muted mt-2">Formato: HH:MM (24 horas)</Text>
          </View>

          {/* Date Input */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-2">Fecha</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="2026-01-02"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-2xl p-5 text-xl text-foreground"
              style={{ fontSize: 20 }}
            />
            <Text className="text-sm text-muted mt-2">Formato: AAAA-MM-DD</Text>
          </View>

          {/* Repeat Selection */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Repetir</Text>
            <View className="gap-3">
              {repeats.map((r) => (
                <Pressable
                  key={r.value}
                  onPress={() => {
                    setRepeat(r.value);
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  className={`p-5 rounded-2xl border ${
                    repeat === r.value ? "bg-primary/10 border-primary" : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-xl font-semibold ${
                      repeat === r.value ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={!title.trim()}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.97 : 1 }],
            opacity: !title.trim() ? 0.5 : 1,
          })}
          className="bg-primary rounded-full p-5 items-center mt-4"
        >
          <Text className="text-white text-xl font-bold">Guardar Recordatorio</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
