import { View, type ViewStyle } from "react-native";
import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

export interface StatItemProps {
  /**
   * The label for the stat
   */
  label: string;
  /**
   * The value to display
   */
  value: string;
}

/**
 * A component for displaying individual statistics with a label and value
 */
export function StatItem({ label, value }: StatItemProps) {
  const { themed, theme } = useAppTheme();

  return (
    <View style={themed($statItem)}>
      <Text style={{ color: theme.colors.textDim }} size="sm">
        {label}
      </Text>
      <Text size="sm" weight="medium">
        {value}
      </Text>
    </View>
  );
}

const $statItem: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.sm,
  minWidth: "48%",
  flexGrow: 1,
});
