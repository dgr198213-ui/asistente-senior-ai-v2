import { ScrollView, Text, View, Pressable, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useReminders } from "@/hooks/use-reminders";
import * as Haptics from "expo-haptics";

export default function RemindersScreen() {
  const colors = useColors();
  const router = useRouter();
  const { reminders, isLoading, toggleReminder, getPendingCount } = useReminders();

  const handleToggle = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleReminder(id);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "medication":
        return "pill.fill";
      case "appointment":
        return "calendar";
      default:
        return "bell.fill";
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case "medication":
        return colors.error;
      case "appointment":
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-base text-muted mt-4">Cargando recordatorios...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Recordatorios</Text>
          <Text className="text-base text-muted mt-1">{getPendingCount()} pendientes</Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {reminders.length === 0 ? (
            <View className="items-center justify-center py-12">
              <IconSymbol size={64} name="bell.fill" color={colors.muted} />
              <Text className="text-xl text-muted mt-4 text-center">No tienes recordatorios</Text>
              <Text className="text-base text-muted mt-2 text-center">Toca el botón de abajo para crear uno</Text>
            </View>
          ) : (
            <View className="gap-3">
              {reminders.map((reminder) => (
                <Pressable
                  key={reminder.id}
                  onPress={() => handleToggle(reminder.id)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  className={`bg-surface rounded-2xl p-5 border ${
                    reminder.completed ? "border-success" : "border-border"
                  }`}
                >
                  <View className="flex-row items-center gap-4">
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center ${
                        reminder.completed ? "bg-success" : "bg-primary/20"
                      }`}
                    >
                      {reminder.completed ? (
                        <IconSymbol size={28} name="checkmark.circle.fill" color="#ffffff" />
                      ) : (
                        <IconSymbol
                          size={28}
                          name={getIconForType(reminder.type)}
                          color={getColorForType(reminder.type)}
                        />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-xl font-semibold ${
                          reminder.completed ? "text-muted line-through" : "text-foreground"
                        }`}
                      >
                        {reminder.title}
                      </Text>
                      <Text className="text-base text-muted mt-1">{reminder.time}</Text>
                      {reminder.repeat && reminder.repeat !== "none" && (
                        <Text className="text-sm text-primary mt-1">
                          Se repite {reminder.repeat === "daily" ? "diariamente" : "semanalmente"}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        <Pressable
          onPress={() => router.push("/add-reminder")}
          style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
          className="bg-primary rounded-full p-5 items-center mt-6"
        >
          <View className="flex-row items-center gap-2">
            <IconSymbol size={24} name="plus.circle.fill" color="#ffffff" />
            <Text className="text-white text-xl font-bold">Agregar Recordatorio</Text>
          </View>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
