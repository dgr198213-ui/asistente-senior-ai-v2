import { TextInput, View, Text, TextInputProps } from "react-native";
import { useColors } from "@/hooks/use-colors";

export interface AccessibleTextInputProps extends TextInputProps {
  /**
   * Label for the input
   */
  label?: string;

  /**
   * Helper text below the input
   */
  helperText?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Container style
   */
  containerClassName?: string;

  /**
   * Minimum font size (default: 16)
   */
  minFontSize?: number;
}

/**
 * Accessible Text Input Component
 * Optimized for senior users with:
 * - Large, clear text
 * - High contrast
 * - Clear labels
 * - Error messages
 * - Font scaling enabled
 */
export function AccessibleTextInput({
  label,
  helperText,
  error,
  containerClassName,
  minFontSize = 16,
  ...props
}: AccessibleTextInputProps) {
  const colors = useColors();

  return (
    <View className={containerClassName}>
      {label && (
        <Text
          className="text-lg font-semibold text-foreground mb-2"
          allowFontScaling={true}
          style={{ fontSize: minFontSize }}
        >
          {label}
        </Text>
      )}

      <TextInput
        {...props}
        allowFontScaling={true}
        placeholderTextColor={colors.muted}
        style={[
          {
            fontSize: minFontSize,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: error ? colors.error : colors.border,
            backgroundColor: colors.surface,
            color: colors.foreground,
            minHeight: 60,
          },
          props.style,
        ]}
        accessibilityLabel={label}
        accessibilityHint={helperText}
      />

      {error && (
        <Text
          className="text-base text-error mt-2"
          allowFontScaling={true}
          style={{ fontSize: minFontSize - 2 }}
        >
          ⚠ {error}
        </Text>
      )}

      {helperText && !error && (
        <Text
          className="text-base text-muted mt-2"
          allowFontScaling={true}
          style={{ fontSize: minFontSize - 2 }}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
}
