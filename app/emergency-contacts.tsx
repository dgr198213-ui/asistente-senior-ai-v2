import { ScrollView, Text, View, Pressable, Platform, ActivityIndicator, Linking } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useEmergencyContacts } from "@/hooks/use-emergency-contacts";
import * as Haptics from "expo-haptics";

export default function EmergencyContactsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { contacts, isLoading, toggleFavorite } = useEmergencyContacts();

  const handleCall = (phone: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleToggleFavorite = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleFavorite(id);
  };

  if (isLoading) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-6">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-base text-muted mt-4">Cargando contactos...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-6">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="p-2 mr-3">
            <IconSymbol size={28} name="chevron.left" color={colors.foreground} />
          </Pressable>
          <Text className="text-3xl font-bold text-foreground">Contactos de Emergencia</Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {contacts.length === 0 ? (
            <View className="items-center justify-center py-12">
              <IconSymbol size={64} name="phone.fill" color={colors.muted} />
              <Text className="text-xl text-muted mt-4 text-center">No tienes contactos de emergencia</Text>
              <Text className="text-base text-muted mt-2 text-center px-8">
                Agrega contactos de confianza para llamarlos rápidamente en caso de emergencia
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {contacts.map((contact) => (
                <View
                  key={contact.id}
                  className="bg-surface rounded-2xl p-5 border border-border"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-2xl font-bold text-foreground">{contact.name}</Text>
                      <Text className="text-base text-muted mt-1">{contact.relationship}</Text>
                    </View>
                    <Pressable
                      onPress={() => handleToggleFavorite(contact.id)}
                      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                      className="p-2"
                    >
                      <IconSymbol
                        size={28}
                        name={contact.isFavorite ? "star.fill" : "star"}
                        color={contact.isFavorite ? colors.warning : colors.muted}
                      />
                    </Pressable>
                  </View>

                  <View className="flex-row items-center gap-3">
                    <View className="flex-1 bg-primary/10 rounded-xl p-4">
                      <Text className="text-lg font-semibold text-primary">{contact.phone}</Text>
                    </View>
                    <Pressable
                      onPress={() => handleCall(contact.phone)}
                      style={({ pressed }) => ({
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      })}
                      className="bg-primary rounded-xl p-4"
                    >
                      <IconSymbol size={32} name="phone.fill" color="#ffffff" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <Pressable
          onPress={() => router.push("/add-emergency-contact")}
          style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
          className="bg-primary rounded-full p-5 items-center mt-6"
        >
          <View className="flex-row items-center gap-2">
            <IconSymbol size={24} name="plus.circle.fill" color="#ffffff" />
            <Text className="text-white text-xl font-bold">Agregar Contacto</Text>
          </View>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
