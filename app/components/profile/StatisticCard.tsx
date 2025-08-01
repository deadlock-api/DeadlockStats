import { type StyleProp, View, type ViewStyle } from "react-native";
import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";

export interface StatisticCardProps {
  /**
   * The main title of the statistic
   */
  title: string | React.ReactNode;
  /**
   * The primary value to display
   */
  value: string | number;
  /**
   * Optional subtitle or additional information
   */
  subtitle?: string;
  /**
   * Optional style override for the card
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Optional color override for the value text
   */
  valueColor?: string;
}

/**
 * A reusable card component for displaying statistics with title, value, and optional subtitle
 */
export function StatisticCard(props: StatisticCardProps) {
  const { title, value, subtitle, style, valueColor } = props;
  const { themed } = useAppTheme();

  return (
    <View style={[themed($cardContainer), style]}>
      <Text style={$styles.textCenter} numberOfLines={1}>
        {title}
      </Text>

      <Text style={[themed($valueText), $styles.textCenter, valueColor && { color: valueColor }]} numberOfLines={1}>
        {typeof value === "number" ? value.toString() : value}
      </Text>

      {subtitle && (
        <Text style={$styles.textCenter} numberOfLines={2}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const $cardContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.sm,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xxs, // Provides consistent spacing between text elements
  borderColor: colors.palette.neutral300,
  borderWidth: 1,
  maxWidth: 120,
});

const $valueText: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 24,
  fontWeight: "bold",
  marginVertical: spacing.xxs,
});
