import { useState, useEffect } from "react";
import { Text, View, Pressable, ScrollView, Platform, Switch, TextInput } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

type FontSize = "small" | "medium" | "large" | "xlarge";

const SETTINGS_STORAGE_KEY = "@asistente_senior_settings";
const API_KEY_STORAGE_KEY = "@asistente_senior_api_key";

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();

  const [fontSize, setFontSize] = useState<FontSize>("large");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        setFontSize(settings.fontSize || "large");
        setNotificationsEnabled(settings.notificationsEnabled ?? true);
        setHapticsEnabled(settings.hapticsEnabled ?? true);
        setDarkMode(settings.darkMode ?? false);
      }
      
      const storedApiKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
      if (storedApiKey) {
        setApiKey(storedApiKey);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
    saveSettings({ fontSize: size, notificationsEnabled, hapticsEnabled, darkMode });
    if (Platform.OS !== "web" && hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleToggle = (setting: "notifications" | "haptics" | "darkMode", value: boolean) => {
    if (Platform.OS !== "web" && hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (setting === "notifications") {
      setNotificationsEnabled(value);
      saveSettings({ fontSize, notificationsEnabled: value, hapticsEnabled, darkMode });
    } else if (setting === "haptics") {
      setHapticsEnabled(value);
      saveSettings({ fontSize, notificationsEnabled, hapticsEnabled: value, darkMode });
    } else if (setting === "darkMode") {
      setDarkMode(value);
      saveSettings({ fontSize, notificationsEnabled, hapticsEnabled, darkMode: value });
    }
  };

  const handleApiKeyChange = async (text: string) => {
    setApiKey(text);
    try {
      await AsyncStorage.setItem(API_KEY_STORAGE_KEY, text);
    } catch (error) {
      console.error("Failed to save API key:", error);
    }
  };

  const fontSizes: { value: FontSize; label: string; example: string }[] = [
    { value: "small", label: "Pequeño", example: "Aa" },
    { value: "medium", label: "Mediano", example: "Aa" },
    { value: "large", label: "Grande", example: "Aa" },
    { value: "xlarge", label: "Muy Grande", example: "Aa" },
  ];

  // Determinar el tamaño numérico para el estilo inline si es necesario
  const getFontSizeValue = () => {
    switch (fontSize) {
      case "small": return 16;
      case "medium": return 20;
      case "large": return 24;
      case "xlarge": return 28;
      default: return 20;
    }
  };

  const currentFontSize = getFontSizeValue();

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-6">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.push("/(tabs)/more")} className="p-2 mr-3">
            <IconSymbol size={28} name="chevron.left" color={colors.foreground} />
          </Pressable>
          <Text className="text-3xl font-bold text-foreground">Configuración</Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Font Size Section */}
          <View className="mb-8">
            <Text className="text-xl font-semibold text-foreground mb-4">Tamaño de Texto</Text>
            <View className="gap-3">
              {fontSizes.map((fs) => (
                <Pressable
                  key={fs.value}
                  onPress={() => handleFontSizeChange(fs.value)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  className={`flex-row items-center justify-between p-5 rounded-2xl border ${
                    fontSize === fs.value ? "bg-primary/10 border-primary" : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-xl font-semibold ${
                      fontSize === fs.value ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {fs.label}
                  </Text>
                  <Text
                    className={`font-bold ${fontSize === fs.value ? "text-primary" : "text-muted"}`}
                    style={{
                      fontSize: fs.value === "small" ? 18 : fs.value === "medium" ? 24 : fs.value === "large" ? 32 : 40,
                    }}
                  >
                    {fs.example}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* API Key Section */}
          <View className="mb-8">
            <Text className="text-xl font-semibold text-foreground mb-4">Conectividad IA</Text>
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <Text 
                className="text-xl font-semibold text-foreground mb-2"
                style={{ fontSize: currentFontSize }}
              >
                API Key de Claude
              </Text>
              <TextInput
                className="border border-border rounded-xl p-4 mt-2 text-foreground bg-background"
                style={{ fontSize: currentFontSize * 0.8 }}
                placeholder="sk-ant-api03-..."
                placeholderTextColor={colors.muted}
                secureTextEntry
                value={apiKey}
                onChangeText={handleApiKeyChange}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text className="text-sm text-muted mt-3">
                Esta clave permite que el asistente de voz responda usando la inteligencia de Claude.
              </Text>
            </View>
          </View>

          {/* Notifications Section */}
          <View className="mb-8">
            <Text className="text-xl font-semibold text-foreground mb-4">Notificaciones</Text>
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-xl font-semibold text-foreground">Activar Notificaciones</Text>
                  <Text className="text-base text-muted mt-1">
                    Recibe recordatorios y alertas importantes
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(value) => handleToggle("notifications", value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          </View>

          {/* Haptics Section */}
          <View className="mb-8">
            <Text className="text-xl font-semibold text-foreground mb-4">Vibración</Text>
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-xl font-semibold text-foreground">Feedback Táctil</Text>
                  <Text className="text-base text-muted mt-1">
                    Vibración al tocar botones
                  </Text>
                </View>
                <Switch
                  value={hapticsEnabled}
                  onValueChange={(value) => handleToggle("haptics", value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          </View>

          {/* Dark Mode Section */}
          <View className="mb-8">
            <Text className="text-xl font-semibold text-foreground mb-4">Apariencia</Text>
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-xl font-semibold text-foreground">Modo Oscuro</Text>
                  <Text className="text-base text-muted mt-1">
                    Tema oscuro para reducir el brillo
                  </Text>
                </View>
                <Switch
                  value={darkMode}
                  onValueChange={(value) => handleToggle("darkMode", value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          </View>

          {/* About Section */}
          <View className="mb-8">
            <Text className="text-xl font-semibold text-foreground mb-4">Acerca de</Text>
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">Asistente Senior AI</Text>
              <Text className="text-base text-muted">Versión 1.0.2</Text>
              <Text className="text-base text-muted mt-3">
                Tu compañero inteligente para el cuidado de la salud y bienestar.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
