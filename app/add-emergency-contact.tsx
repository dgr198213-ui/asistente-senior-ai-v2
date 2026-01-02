import { useState } from "react";
import { Text, View, Pressable, TextInput, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useEmergencyContacts } from "@/hooks/use-emergency-contacts";
import * as Haptics from "expo-haptics";

export default function AddEmergencyContactScreen() {
  const colors = useColors();
  const router = useRouter();
  const { addContact } = useEmergencyContacts();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await addContact({
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim() || "Contacto",
      isFavorite: false,
    });

    router.back();
  };

  const relationships = [
    "Familiar",
    "Hijo/a",
    "Esposo/a",
    "Hermano/a",
    "Amigo/a",
    "Vecino/a",
    "Cuidador/a",
    "Médico",
  ];

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-6">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Pressable onPress={() => router.back()} className="p-2">
            <Text className="text-xl text-primary">Cancelar</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">Nuevo Contacto</Text>
          <View className="w-20" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Name Input */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-2">Nombre</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej: María González"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-2xl p-5 text-xl text-foreground"
              style={{ fontSize: 20 }}
            />
          </View>

          {/* Phone Input */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-2">Teléfono</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Ej: +34 612 345 678"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              className="bg-surface border border-border rounded-2xl p-5 text-xl text-foreground"
              style={{ fontSize: 20 }}
            />
          </View>

          {/* Relationship Selection */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Relación</Text>
            <View className="flex-row flex-wrap gap-2">
              {relationships.map((rel) => (
                <Pressable
                  key={rel}
                  onPress={() => {
                    setRelationship(rel);
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  className={`px-5 py-3 rounded-full border ${
                    relationship === rel ? "bg-primary/10 border-primary" : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-lg font-semibold ${
                      relationship === rel ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {rel}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Custom Relationship Input */}
          {!relationships.includes(relationship) && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-foreground mb-2">Relación Personalizada</Text>
              <TextInput
                value={relationship}
                onChangeText={setRelationship}
                placeholder="Ej: Enfermera"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-2xl p-5 text-xl text-foreground"
                style={{ fontSize: 20 }}
              />
            </View>
          )}
        </ScrollView>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={!name.trim() || !phone.trim()}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.97 : 1 }],
            opacity: !name.trim() || !phone.trim() ? 0.5 : 1,
          })}
          className="bg-primary rounded-full p-5 items-center mt-4"
        >
          <Text className="text-white text-xl font-bold">Guardar Contacto</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
