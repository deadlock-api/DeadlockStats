import { type TextStyle, TouchableOpacity, View, type ViewStyle } from "react-native";
import { useTimeRangeSelected } from "@/app";
import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

const timeRanges = [
  { label: "24h", value: 24 * 60 * 60 },
  { label: "7d", value: 7 * 24 * 60 * 60 },
  { label: "30d", value: 30 * 24 * 60 * 60 },
  { label: "all", value: null },
] as const;
export type TimeRange = (typeof timeRanges)[number];
export const DEFAULT_TIME_RANGE = timeRanges[2];

export const TimeRangeSelect = () => {
  const { themed } = useAppTheme();

  const [timeRange, setTimeRange] = useTimeRangeSelected();

  return (
    <View style={themed($timeRangeContainer)}>
      {timeRanges.map((range) => (
        <TouchableOpacity
          key={range.label}
          onPress={() => setTimeRange(range)}
          style={[themed($timeRangeButton), timeRange.value === range.value && themed($timeRangeButtonActive)]}
        >
          <Text key={range.label} style={themed($timeRangeText)}>
            {range.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
const $timeRangeContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginBottom: spacing.sm,
});

const $timeRangeText: ThemedStyle<TextStyle> = () => ({
  fontSize: 16,
  fontWeight: "bold",
});

const $timeRangeButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.lg,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 20,
});

const $timeRangeButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
});
