import { View, Text, Pressable, Animated } from "react-native";
import { useEffect, useRef, useState } from "react";
import { networkService, NetworkStatus } from "@/lib/network-service";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export interface NetworkStatusBarProps {
  /**
   * Show the status bar even when online
   */
  alwaysShow?: boolean;
}

/**
 * Network Status Bar Component
 * Shows connection status and handles reconnection attempts
 * Displays user-friendly messages instead of technical errors
 */
export function NetworkStatusBar({ alwaysShow = false }: NetworkStatusBarProps) {
  const colors = useColors();
  const [status, setStatus] = useState<NetworkStatus>("online");
  const [isRetrying, setIsRetrying] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = networkService.subscribe((newStatus) => {
      setStatus(newStatus);

      // Animate in/out
      Animated.timing(slideAnim, {
        toValue: newStatus === "online" ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    return unsubscribe;
  }, [slideAnim]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Trigger a network check
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsRetrying(false);
    } catch (error) {
      setIsRetrying(false);
    }
  };

  if (status === "online" && !alwaysShow) {
    return null;
  }

  const isOffline = status === "offline";
  const isConnecting = status === "connecting";

  const backgroundColor = isOffline ? colors.error : colors.warning;
  const textColor = "#ffffff";

  return (
    <Animated.View
      style={{
        opacity: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        height: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 60],
        }),
      }}
    >
      <View className={`${isOffline ? "bg-error" : "bg-warning"} px-4 py-3 flex-row items-center justify-between`}>
        <View className="flex-row items-center gap-3 flex-1">
          {isConnecting ? (
            <Text className="text-lg font-bold text-white">⟳</Text>
          ) : (
            <IconSymbol size={24} name="wifi.slash" color={textColor} />
          )}
          <View className="flex-1">
            <Text className="text-base font-semibold text-white" allowFontScaling={true}>
              {isOffline ? "Sin conexión" : "Conectando..."}
            </Text>
            <Text className="text-sm text-white/80" allowFontScaling={true}>
              {isOffline ? "Intentando reconectar..." : "Por favor espera..."}
            </Text>
          </View>
        </View>

        {isOffline && (
          <Pressable
            onPress={handleRetry}
            disabled={isRetrying}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            className="bg-white/20 rounded-lg px-4 py-2"
          >
            <Text className="text-white font-semibold text-base" allowFontScaling={true}>
              {isRetrying ? "Reintentando..." : "Reintentar"}
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
