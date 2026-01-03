import { ScrollView, Text, View, Pressable, Modal, TextInput, Platform, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getHealthKitData } from "@/lib/health-kit-service";

interface HealthMeasurement {
  id: string;
  type: "blood_pressure" | "glucose" | "weight" | "heart_rate";
  value: string;
  unit: string;
  date: string;
  notes?: string;
}

export default function HealthEnhancedScreen() {
  const colors = useColors();
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<HealthMeasurement["type"]>("blood_pressure");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoadingHealthKit, setIsLoadingHealthKit] = useState(false);
  const [healthKitData, setHealthKitData] = useState<any>(null);

  const healthTypes = [
    { id: "blood_pressure", label: "Presión Arterial", unit: "mmHg", icon: "heart.fill", color: "#EF4444" },
    { id: "glucose", label: "Glucosa", unit: "mg/dL", icon: "drop.fill", color: "#F59E0B" },
    { id: "weight", label: "Peso", unit: "kg", icon: "scale.3d", color: "#8B5CF6" },
    { id: "heart_rate", label: "Ritmo Cardíaco", unit: "bpm", icon: "heart.fill", color: "#EC4899" },
  ];

  // Cargar datos de HealthKit al iniciar
  useEffect(() => {
    loadHealthKitData();
  }, []);

  const loadHealthKitData = async () => {
    if (Platform.OS === "web") return;
    
    setIsLoadingHealthKit(true);
    try {
      const data = await getHealthKitData();
      setHealthKitData(data);
    } catch (error) {
      console.log("HealthKit no disponible o sin permiso");
    } finally {
      setIsLoadingHealthKit(false);
    }
  };

  const handleAddMeasurement = () => {
    if (!value.trim()) {
      Alert.alert("Error", "Por favor ingresa un valor");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newMeasurement: HealthMeasurement = {
      id: Date.now().toString(),
      type: selectedType,
      value: value.trim(),
      unit: healthTypes.find(t => t.id === selectedType)?.unit || "",
      date: new Date().toLocaleString("es-ES"),
      notes: notes.trim() || undefined,
    };

    setMeasurements([newMeasurement, ...measurements]);
    setValue("");
    setNotes("");
    setShowModal(false);

    Alert.alert("Éxito", "Medición registrada correctamente");
  };

  const handleDeleteMeasurement = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      "Eliminar medición",
      "¿Estás seguro de que deseas eliminar esta medición?",
      [
        { text: "Cancelar", onPress: () => {} },
        { 
          text: "Eliminar", 
          onPress: () => setMeasurements(measurements.filter(m => m.id !== id)),
          style: "destructive"
        }
      ]
    );
  };

  const getHealthTypeInfo = (typeId: string) => {
    return healthTypes.find(t => t.id === typeId);
  };

  const getStatusColor = (type: string, value: string) => {
    const numValue = parseFloat(value);
    
    switch (type) {
      case "blood_pressure":
        // Formato: "120/80"
        const [systolic] = value.split("/").map(v => parseFloat(v));
        if (systolic < 120) return colors.success;
        if (systolic < 140) return colors.warning;
        return colors.error;
      case "glucose":
        if (numValue < 100) return colors.success;
        if (numValue < 126) return colors.warning;
        return colors.error;
      case "weight":
        return colors.muted; // No hay rango específico
      case "heart_rate":
        if (numValue >= 60 && numValue <= 100) return colors.success;
        return colors.warning;
      default:
        return colors.muted;
    }
  };

  const getStatusLabel = (type: string, value: string) => {
    const numValue = parseFloat(value);
    
    switch (type) {
      case "blood_pressure":
        const [systolic] = value.split("/").map(v => parseFloat(v));
        if (systolic < 120) return "Normal";
        if (systolic < 140) return "Elevada";
        return "Alta";
      case "glucose":
        if (numValue < 100) return "Normal";
        if (numValue < 126) return "Prediabetes";
        return "Alta";
      case "weight":
        return "Registrado";
      case "heart_rate":
        if (numValue >= 60 && numValue <= 100) return "Normal";
        return "Anormal";
      default:
        return "Registrado";
    }
  };

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Mi Salud</Text>
          <Text className="text-base text-muted mt-1">Registra y monitorea tus mediciones</Text>
        </View>

        {/* Botón HealthKit */}
        {Platform.OS !== "web" && (
          <Pressable
            onPress={loadHealthKitData}
            disabled={isLoadingHealthKit}
            className="mb-4 bg-blue-100 rounded-lg p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <IconSymbol size={24} name="heart.fill" color="#3B82F6" />
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Sincronizar HealthKit</Text>
                <Text className="text-sm text-muted">Importar datos del reloj inteligente</Text>
              </View>
            </View>
            {isLoadingHealthKit && <ActivityIndicator size="small" color="#3B82F6" />}
          </Pressable>
        )}

        {/* Datos de HealthKit */}
        {healthKitData && (
          <View className="mb-4 bg-green-100 rounded-lg p-4">
            <Text className="font-semibold text-foreground mb-2">Datos Sincronizados de HealthKit:</Text>
            {healthKitData.steps && <Text className="text-sm text-foreground">👟 Pasos: {healthKitData.steps}</Text>}
            {healthKitData.heartRate && <Text className="text-sm text-foreground">❤️ Ritmo: {healthKitData.heartRate} bpm</Text>}
            {healthKitData.sleepDuration && <Text className="text-sm text-foreground">😴 Sueño: {healthKitData.sleepDuration}h</Text>}
          </View>
        )}

        {/* Botones de Tipos de Medición */}
        <View className="mb-6 flex-row flex-wrap gap-2">
          {healthTypes.map(type => (
            <Pressable
              key={type.id}
              onPress={() => {
                setSelectedType(type.id as any);
                setShowModal(true);
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="flex-1 min-w-[45%] bg-surface border border-border rounded-lg p-4 items-center"
            >
              <IconSymbol size={28} name={type.icon as any} color={type.color} />
              <Text className="text-sm font-semibold text-foreground mt-2 text-center">{type.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Lista de Mediciones */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {measurements.length === 0 ? (
            <View className="items-center justify-center py-12">
              <IconSymbol size={48} name="heart.fill" color={colors.muted} />
              <Text className="text-lg font-semibold text-foreground mt-4">No hay mediciones</Text>
              <Text className="text-base text-muted text-center mt-2">
                Toca un botón arriba para registrar tu primera medición
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {measurements.map(measurement => {
                const typeInfo = getHealthTypeInfo(measurement.type);
                const statusColor = getStatusColor(measurement.type, measurement.value);
                const statusLabel = getStatusLabel(measurement.type, measurement.value);

                return (
                  <Pressable
                    key={measurement.id}
                    onLongPress={() => handleDeleteMeasurement(measurement.id)}
                    className="bg-surface border border-border rounded-lg p-4 flex-row items-center justify-between"
                  >
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2">
                        <IconSymbol size={20} name={typeInfo?.icon as any} color={typeInfo?.color || colors.primary} />
                        <Text className="font-semibold text-foreground">{typeInfo?.label}</Text>
                        <View 
                          className="px-2 py-1 rounded-full"
                          style={{ backgroundColor: statusColor + "20" }}
                        >
                          <Text 
                            className="text-xs font-semibold"
                            style={{ color: statusColor }}
                          >
                            {statusLabel}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-2xl font-bold text-foreground">
                        {measurement.value} <Text className="text-base text-muted">{measurement.unit}</Text>
                      </Text>
                      <Text className="text-xs text-muted mt-1">{measurement.date}</Text>
                      {measurement.notes && (
                        <Text className="text-sm text-muted mt-2 italic">Nota: {measurement.notes}</Text>
                      )}
                    </View>
                    <IconSymbol size={20} name="chevron.right" color={colors.muted} />
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Botón Agregar */}
        <Pressable
          onPress={() => setShowModal(true)}
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          className="mt-4 bg-primary rounded-xl py-4 items-center"
        >
          <View className="flex-row items-center gap-2">
            <IconSymbol size={24} name="plus.circle.fill" color="white" />
            <Text className="text-white font-semibold text-lg">Agregar Medición</Text>
          </View>
        </Pressable>
      </View>

      {/* Modal de Agregar Medición */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 pb-12">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">
                {getHealthTypeInfo(selectedType)?.label}
              </Text>
              <Pressable onPress={() => setShowModal(false)}>
                <IconSymbol size={28} name="xmark.circle.fill" color={colors.muted} />
              </Pressable>
            </View>

            {/* Selector de Tipo */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-foreground mb-3">Tipo de Medición</Text>
              <View className="flex-row flex-wrap gap-2">
                {healthTypes.map(type => (
                  <Pressable
                    key={type.id}
                    onPress={() => setSelectedType(type.id as any)}
                    className={cn(
                      "flex-1 min-w-[45%] p-3 rounded-lg border-2",
                      selectedType === type.id
                        ? "bg-primary border-primary"
                        : "bg-surface border-border"
                    )}
                  >
                    <Text 
                      className={cn(
                        "text-sm font-semibold text-center",
                        selectedType === type.id ? "text-white" : "text-foreground"
                      )}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Entrada de Valor */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-foreground mb-2">Valor</Text>
              <View className="flex-row items-center gap-2 bg-surface border border-border rounded-lg p-4">
                <TextInput
                  value={value}
                  onChangeText={setValue}
                  placeholder="Ej: 120/80"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  className="flex-1 text-2xl font-bold text-foreground"
                />
                <Text className="text-lg font-semibold text-muted">
                  {getHealthTypeInfo(selectedType)?.unit}
                </Text>
              </View>
            </View>

            {/* Notas */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-foreground mb-2">Notas (Opcional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Ej: Después de comer"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                className="bg-surface border border-border rounded-lg p-4 text-foreground"
              />
            </View>

            {/* Botones */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowModal(false)}
                className="flex-1 bg-surface border border-border rounded-lg py-4 items-center"
              >
                <Text className="text-foreground font-semibold">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleAddMeasurement}
                className="flex-1 bg-primary rounded-lg py-4 items-center"
              >
                <Text className="text-white font-semibold">Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
