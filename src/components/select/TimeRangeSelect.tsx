import { type TextStyle, TouchableOpacity, View, type ViewStyle } from "react-native";
import { useTimeRangeSelected } from "../../app/_layout";
import { Text } from "../ui/Text";
import { useAppTheme } from "../../theme/context";
import type { ThemedStyle } from "../../theme/types";

const timeRanges = [
  { labelKey: "timeRangeSelect:label24h", value: 24 * 60 * 60 },
  { labelKey: "timeRangeSelect:label7d", value: 7 * 24 * 60 * 60 },
  { labelKey: "timeRangeSelect:label30d", value: 30 * 24 * 60 * 60 },
  { labelKey: "timeRangeSelect:labelAll", value: null },
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
          key={range.labelKey}
          onPress={() => setTimeRange(range)}
          style={[themed($timeRangeButton), timeRange.value === range.value && themed($timeRangeButtonActive)]}
        >
          <Text key={range.labelKey} style={themed($timeRangeText)} size="sm" tx={range.labelKey} />
        </TouchableOpacity>
      ))}
    </View>
  );
};
const $timeRangeContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-evenly",
  alignItems: "center",
  gap: spacing.sm,
  marginBottom: spacing.sm,
});

const $timeRangeText: ThemedStyle<TextStyle> = () => ({
  fontWeight: "bold",
});

const $timeRangeButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.lg,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 20,
});

const $timeRangeButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
});
