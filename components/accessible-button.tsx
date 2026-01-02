import { Pressable, Text, View, ViewStyle, TextStyle, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

export interface AccessibleButtonProps {
  /**
   * Button label text
   */
  label: string;

  /**
   * Callback when pressed
   */
  onPress: () => void;

  /**
   * Button variant
   */
  variant?: "primary" | "secondary" | "danger" | "success";

  /**
   * Button size
   */
  size?: "small" | "medium" | "large";

  /**
   * Disable button
   */
  disabled?: boolean;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Custom styles
   */
  style?: ViewStyle;

  /**
   * Icon component (optional)
   */
  icon?: React.ReactNode;

  /**
   * Icon position
   */
  iconPosition?: "left" | "right";

  /**
   * Enable haptic feedback
   */
  enableHaptics?: boolean;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

/**
 * Accessible Button Component
 * Optimized for senior users with:
 * - Minimum 60px touch target
 * - Large, clear text
 * - High contrast colors
 * - Haptic feedback
 * - Clear visual states
 */
export function AccessibleButton({
  label,
  onPress,
  variant = "primary",
  size = "large",
  disabled = false,
  isLoading = false,
  style,
  icon,
  iconPosition = "left",
  enableHaptics = true,
  accessibilityLabel,
}: AccessibleButtonProps) {
  const colors = useColors();

  // Size configuration
  const sizeConfig = {
    small: { padding: 12, fontSize: 14 },
    medium: { padding: 16, fontSize: 16 },
    large: { padding: 20, fontSize: 18 },
  };

  const config = sizeConfig[size];

  // Color configuration
  const variantConfig = {
    primary: {
      bg: colors.primary,
      text: "#ffffff",
      disabled: colors.muted,
    },
    secondary: {
      bg: colors.surface,
      text: colors.foreground,
      disabled: colors.muted,
    },
    danger: {
      bg: colors.error,
      text: "#ffffff",
      disabled: colors.muted,
    },
    success: {
      bg: colors.success,
      text: "#ffffff",
      disabled: colors.muted,
    },
  };

  const colorConfig = variantConfig[variant];

  const handlePress = () => {
    if (disabled || isLoading) return;

    // Haptic feedback
    if (enableHaptics && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || isLoading}
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
      })}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: isLoading }}
    >
      <View
        style={[
          {
            paddingVertical: config.padding,
            paddingHorizontal: config.padding * 1.5,
            backgroundColor: disabled ? colorConfig.disabled : colorConfig.bg,
            borderRadius: 12,
            minHeight: 60,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 8,
          },
          style,
        ]}
      >
        {icon && iconPosition === "left" && icon}

        {isLoading ? (
          <Text
            style={{
              fontSize: config.fontSize,
              fontWeight: "600",
              color: colorConfig.text,
            }}
            allowFontScaling={true}
          >
            Cargando...
          </Text>
        ) : (
          <Text
            style={{
              fontSize: config.fontSize,
              fontWeight: "600",
              color: colorConfig.text,
            }}
            allowFontScaling={true}
          >
            {label}
          </Text>
        )}

        {icon && iconPosition === "right" && icon}
      </View>
    </Pressable>
  );
}
