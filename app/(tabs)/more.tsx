import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function MoreScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1">
        <Text className="text-3xl font-bold text-foreground mb-6">Más Opciones</Text>
        <ScrollView className="flex-1">
          <View className="gap-3">
            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              className="bg-surface rounded-2xl p-6 border border-border"
            >
              <View className="flex-row items-center gap-4">
                <IconSymbol size={32} name="phone.fill" color={colors.primary} />
                <Text className="text-xl font-semibold text-foreground">Contactos de Emergencia</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push("/emergency")}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              className="bg-error/10 rounded-2xl p-6 border border-error"
            >
              <View className="flex-row items-center gap-4">
                <IconSymbol size={32} name="exclamationmark.triangle.fill" color={colors.error} />
                <Text className="text-xl font-semibold text-error">Emergencia</Text>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              className="bg-surface rounded-2xl p-6 border border-border"
            >
              <View className="flex-row items-center gap-4">
                <IconSymbol size={32} name="gear" color={colors.muted} />
                <Text className="text-xl font-semibold text-foreground">Configuración</Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
