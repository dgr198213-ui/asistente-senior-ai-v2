import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 64 + bottomPadding; // Increased height for better accessibility

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 10,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "Asistente",
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="mic.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: "Recordatorios",
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="bell.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: "Salud",
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="heart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="wellness"
        options={{
          title: "Bienestar",
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="star.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Más",
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="ellipsis.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
