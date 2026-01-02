import { View, Text, ActivityIndicator } from "react-native";
import { useAppInit } from "@/hooks/use-app-init";
import { useColors } from "@/hooks/use-colors";

export interface AppInitializerProps {
  children: React.ReactNode;
}

/**
 * App Initializer Component
 * Handles app initialization with config loading and network setup
 * Shows loading screen while initializing, error screen if something fails
 */
export function AppInitializer({ children }: AppInitializerProps) {
  const colors = useColors();
  const { status, error, isReady } = useAppInit();

  if (status === "initializing") {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-lg text-foreground mt-4 font-semibold">Inicializando aplicación...</Text>
        <Text className="text-base text-muted mt-2">Por favor espera un momento</Text>
      </View>
    );
  }

  if (status === "error" || !isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <View className="bg-error/10 rounded-2xl p-6 border border-error mb-6">
          <Text className="text-2xl font-bold text-error mb-2">Error de Inicialización</Text>
          <Text className="text-base text-foreground">{error || "No se pudo inicializar la aplicación"}</Text>
        </View>
        <Text className="text-base text-muted text-center">
          La aplicación intentará cargar en modo offline. Por favor, verifica tu conexión a internet.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}
