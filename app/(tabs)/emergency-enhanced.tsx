import { ScrollView, Text, View, Pressable, Platform, Alert, Linking } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Accelerometer } from "expo-sensors";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isFavorite: boolean;
}

export default function EmergencyEnhancedScreen() {
  const colors = useColors();
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [fallDetected, setFallDetected] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    {
      id: "1",
      name: "Hijo/a",
      phone: "+1234567890",
      relationship: "Familiar",
      isFavorite: true,
    },
    {
      id: "2",
      name: "Médico",
      phone: "+0987654321",
      relationship: "Médico",
      isFavorite: false,
    },
  ]);

  // Monitorear acelerómetro para detectar caídas
  useEffect(() => {
    if (Platform.OS === "web") return;

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      // Detectar movimiento brusco (caída)
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      
      // Si la magnitud es muy alta (caída típica > 50m/s²)
      if (magnitude > 50) {
        detectFall();
      }
    });

    // Establecer intervalo de actualización
    Accelerometer.setUpdateInterval(100);

    return () => subscription.remove();
  }, []);

  // Countdown para emergencia
  useEffect(() => {
    if (!countdownActive) return;

    if (countdown === 0) {
      callEmergency();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdownActive, countdown]);

  const detectFall = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    setFallDetected(true);
    setCountdownActive(true);
    setCountdown(10);

    Alert.alert(
      "¡Caída Detectada!",
      "Se detectó una posible caída. ¿Estás bien?",
      [
        { 
          text: "Estoy bien", 
          onPress: () => {
            setFallDetected(false);
            setCountdownActive(false);
          }
        },
        { 
          text: "Necesito ayuda", 
          onPress: () => callEmergency(),
          style: "destructive"
        }
      ]
    );
  };

  const handleEmergencyPress = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setCountdownActive(true);
    setCountdown(10);
  };

  const handleCancelEmergency = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setCountdownActive(false);
    setCountdown(10);
    setFallDetected(false);
  };

  const callEmergency = () => {
    const favoriteContact = emergencyContacts.find(c => c.isFavorite);
    if (favoriteContact) {
      Linking.openURL(`tel:${favoriteContact.phone}`);
    } else if (emergencyContacts.length > 0) {
      Linking.openURL(`tel:${emergencyContacts[0].phone}`);
    }
  };

  const callContact = (phone: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL(`tel:${phone}`);
  };

  const toggleFavorite = (id: string) => {
    setEmergencyContacts(
      emergencyContacts.map(contact =>
        contact.id === id
          ? { ...contact, isFavorite: !contact.isFavorite }
          : { ...contact, isFavorite: false }
      )
    );
  };

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Emergencia</Text>
          <Text className="text-base text-muted mt-1">Acceso rápido a ayuda</Text>
        </View>

        {/* Botón SOS Grande */}
        <Pressable
          onPress={handleEmergencyPress}
          disabled={countdownActive}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          className={cn(
            "mb-6 rounded-3xl p-8 items-center justify-center",
            countdownActive ? "bg-error" : "bg-error"
          )}
        >
          <IconSymbol size={80} name="phone.fill" color="white" />
          <Text className="text-white text-3xl font-bold mt-4">SOS</Text>
          <Text className="text-white text-lg mt-2">Presiona para emergencia</Text>
        </Pressable>

        {/* Countdown */}
        {countdownActive && (
          <View className="mb-6 bg-error/20 border-2 border-error rounded-xl p-6 items-center">
            <Text className="text-4xl font-bold text-error mb-2">{countdown}</Text>
            <Text className="text-lg font-semibold text-foreground mb-4">
              Llamando al contacto de emergencia...
            </Text>
            <Pressable
              onPress={handleCancelEmergency}
              className="bg-error rounded-lg px-6 py-3"
            >
              <Text className="text-white font-semibold">Cancelar</Text>
            </Pressable>
          </View>
        )}

        {/* Alerta de Caída */}
        {fallDetected && (
          <View className="mb-6 bg-yellow-100 border-2 border-yellow-500 rounded-xl p-4 flex-row items-center gap-3">
            <IconSymbol size={32} name="exclamationmark.triangle.fill" color="#F59E0B" />
            <View className="flex-1">
              <Text className="font-semibold text-foreground">Caída Detectada</Text>
              <Text className="text-sm text-muted">Se está llamando a emergencia...</Text>
            </View>
          </View>
        )}

        {/* Contactos de Emergencia */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <Text className="text-lg font-semibold text-foreground mb-4">Contactos de Emergencia</Text>

          {emergencyContacts.length === 0 ? (
            <View className="items-center justify-center py-12 bg-surface rounded-lg">
              <IconSymbol size={48} name="person.fill" color={colors.muted} />
              <Text className="text-lg font-semibold text-foreground mt-4">
                No hay contactos
              </Text>
              <Text className="text-base text-muted text-center mt-2">
                Agrega contactos de emergencia en la sección de Más
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {emergencyContacts.map(contact => (
                <View
                  key={contact.id}
                  className={cn(
                    "flex-row items-center justify-between p-4 rounded-lg border-2",
                    contact.isFavorite
                      ? "bg-primary/10 border-primary"
                      : "bg-surface border-border"
                  )}
                >
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-lg font-semibold text-foreground">
                        {contact.name}
                      </Text>
                      {contact.isFavorite && (
                        <IconSymbol size={16} name="star.fill" color={colors.primary} />
                      )}
                    </View>
                    <Text className="text-sm text-muted">{contact.relationship}</Text>
                    <Text className="text-base font-mono text-foreground mt-1">
                      {contact.phone}
                    </Text>
                  </View>

                  <View className="flex-row gap-2">
                    {/* Botón Llamar */}
                    <Pressable
                      onPress={() => callContact(contact.phone)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                      className="bg-green-500 rounded-full p-3"
                    >
                      <IconSymbol size={24} name="phone.fill" color="white" />
                    </Pressable>

                    {/* Botón Favorito */}
                    <Pressable
                      onPress={() => toggleFavorite(contact.id)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                      className={cn(
                        "rounded-full p-3",
                        contact.isFavorite ? "bg-primary" : "bg-surface border border-border"
                      )}
                    >
                      <IconSymbol
                        size={24}
                        name="star.fill"
                        color={contact.isFavorite ? "white" : colors.muted}
                      />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Información de Seguridad */}
          <View className="mt-8 bg-blue-100 rounded-lg p-4">
            <View className="flex-row items-start gap-3">
              <IconSymbol size={24} name="info.circle.fill" color="#3B82F6" />
              <View className="flex-1">
                <Text className="font-semibold text-foreground mb-2">Detección de Caídas</Text>
                <Text className="text-sm text-foreground">
                  La app monitorea el acelerómetro de tu dispositivo para detectar caídas automáticamente. Si se detecta una, se iniciará una llamada de emergencia.
                </Text>
              </View>
            </View>
          </View>

          {/* Números de Emergencia */}
          <View className="mt-6 bg-red-100 rounded-lg p-4">
            <Text className="font-semibold text-foreground mb-3">Números de Emergencia Importantes</Text>
            <View className="gap-2">
              <Pressable
                onPress={() => callContact("911")}
                className="flex-row items-center justify-between bg-white rounded-lg p-3"
              >
                <Text className="font-semibold text-foreground">Emergencias Médicas</Text>
                <Text className="text-lg font-bold text-error">911</Text>
              </Pressable>
              <Pressable
                onPress={() => callContact("911")}
                className="flex-row items-center justify-between bg-white rounded-lg p-3"
              >
                <Text className="font-semibold text-foreground">Policía</Text>
                <Text className="text-lg font-bold text-error">911</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
