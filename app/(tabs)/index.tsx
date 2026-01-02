import { ScrollView, Text, View, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { NetworkStatusBar } from "@/components/network-status-bar";
import { useState, useEffect } from "react";
import { useReminders } from "@/hooks/use-reminders";

/**
 * Home Screen - Pantalla principal del Asistente Senior AI
 * Muestra saludo personalizado y accesos rápidos a las funciones principales
 */
export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { getPendingCount } = useReminders();
  const [greeting, setGreeting] = useState("");
  const [userName] = useState("Usuario"); // TODO: Get from user profile

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Buenos días");
    } else if (hour < 20) {
      setGreeting("Buenas tardes");
    } else {
      setGreeting("Buenas noches");
    }
  }, []);

  const handlePress = (action: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    switch (action) {
      case "assistant":
        router.push("/(tabs)/assistant");
        break;
      case "reminders":
        router.push("/(tabs)/reminders");
        break;
      case "health":
        router.push("/(tabs)/health");
        break;
      case "contacts":
        router.push("/emergency-contacts");
        break;
      case "emergency":
        router.push("/emergency");
        break;
    }
  };

  return (
    <>
      <NetworkStatusBar />
      <ScreenContainer className="p-6">
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 gap-6">
            {/* Greeting Section */}
            <View className="gap-2 mt-4">
              <Text className="text-5xl font-bold text-foreground">
                {greeting}
              </Text>
              <Text className="text-2xl text-muted">
                {userName}
              </Text>
            </View>

            {/* Voice Assistant Button */}
            <Pressable
              onPress={() => handlePress("assistant")}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              })}
              className="bg-primary rounded-3xl p-8 items-center justify-center shadow-lg"
            >
              <IconSymbol size={64} name="mic.fill" color="#ffffff" />
              <Text className="text-white text-2xl font-bold mt-4">
                Hablar con Asistente
              </Text>
              <Text className="text-white/80 text-base mt-2 text-center">
                Toca para activar el asistente de voz
              </Text>
            </Pressable>

            {/* Quick Access Cards */}
            <View className="gap-4">
              <Text className="text-xl font-semibold text-foreground">
                Accesos Rápidos
              </Text>

              {/* Reminders Card */}
              <Pressable
                onPress={() => handlePress("reminders")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                className="bg-surface rounded-2xl p-6 border border-border"
              >
                <View className="flex-row items-center gap-4">
                  <View className="bg-warning/20 rounded-full p-4">
                    <IconSymbol size={40} name="bell.fill" color={colors.warning} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-semibold text-foreground">
                      Recordatorios
                    </Text>
                    <Text className="text-base text-muted mt-1">
                      {getPendingCount()} pendientes
                    </Text>
                  </View>
                  <IconSymbol size={24} name="chevron.right" color={colors.muted} />
                </View>
              </Pressable>

              {/* Health Card */}
              <Pressable
                onPress={() => handlePress("health")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                className="bg-surface rounded-2xl p-6 border border-border"
              >
                <View className="flex-row items-center gap-4">
                  <View className="bg-error/20 rounded-full p-4">
                    <IconSymbol size={40} name="heart.fill" color={colors.error} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-semibold text-foreground">
                      Salud
                    </Text>
                    <Text className="text-base text-muted mt-1">
                      Registra tus datos
                    </Text>
                  </View>
                  <IconSymbol size={24} name="chevron.right" color={colors.muted} />
                </View>
              </Pressable>

              {/* Contacts Card */}
              <Pressable
                onPress={() => handlePress("contacts")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                className="bg-surface rounded-2xl p-6 border border-border"
              >
                <View className="flex-row items-center gap-4">
                  <View className="bg-primary/20 rounded-full p-4">
                    <IconSymbol size={40} name="phone.fill" color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-semibold text-foreground">
                      Contactos
                    </Text>
                    <Text className="text-base text-muted mt-1">
                      Llama a tus seres queridos
                    </Text>
                  </View>
                  <IconSymbol size={24} name="chevron.right" color={colors.muted} />
                </View>
              </Pressable>
            </View>

            {/* Emergency Button */}
            <Pressable
              onPress={() => handlePress("emergency")}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              })}
              className="bg-error rounded-3xl p-6 items-center justify-center shadow-lg mt-2"
            >
              <IconSymbol size={48} name="exclamationmark.triangle.fill" color="#ffffff" />
              <Text className="text-white text-2xl font-bold mt-3">
                EMERGENCIA
              </Text>
              <Text className="text-white/80 text-base mt-1">
                Toca para obtener ayuda inmediata
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
