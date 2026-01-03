import { Text, View, Pressable, Linking, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";

export default function EmergencyScreen() {
  const router = useRouter();

  const handleEmergencyCall = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Linking.openURL("tel:911");
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-6 bg-error/5">
      <View className="flex-1 justify-between">
        <View>
          <Pressable onPress={() => router.push("/(tabs)")} className="mb-6">
            <Text className="text-xl text-foreground">← Volver al Inicio</Text>
          </Pressable>
          <Text className="text-4xl font-bold text-error mb-4">EMERGENCIA</Text>
          <Text className="text-xl text-foreground">Presiona el botón para llamar al 911</Text>
        </View>

        <Pressable
          onPress={handleEmergencyCall}
          style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}
          className="bg-error rounded-3xl p-12 items-center justify-center shadow-lg"
        >
          <IconSymbol size={80} name="phone.fill" color="#ffffff" />
          <Text className="text-white text-4xl font-bold mt-6">LLAMAR 911</Text>
        </Pressable>

        <View className="bg-surface rounded-2xl p-6 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-2">Información Médica</Text>
          <Text className="text-base text-muted">Alergias: Ninguna</Text>
          <Text className="text-base text-muted">Condiciones: Hipertensión</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
