import { useFont } from "@shopify/react-native-skia";
import React, { useMemo } from "react";
import { type TextStyle, View, type ViewStyle } from "react-native";
import { Text } from "src/components/ui/Text";
import type { Metrics } from "src/services/api/types/player_stats_metrics";
import { useAppTheme } from "src/theme/context";
import type { ThemedStyle } from "src/theme/types";
import { calculateDataRange, formatXAxisLabel, formatYAxisLabel } from "src/utils/performanceMetrics";
import { CartesianChart, Line } from "victory-native";

export interface PlayerVsCommunityChartProps {
  /**
   * Community metrics data
   */
  communityMetric: Metrics;
  /**
   * Player metrics data
   */
  playerMetric: Metrics;
  /**
   * Player account ID (currently unused but kept for future use)
   */
  accountId: number;
}

/**
 * Optimized chart component for displaying player vs community performance metrics
 * Uses React.memo for performance optimization and memoized calculations
 */
export const PlayerVsCommunityChart = React.memo<PlayerVsCommunityChartProps>(function PlayerVsCommunityChart({
  communityMetric,
  playerMetric,
}) {
  const { theme, themed } = useAppTheme();
  const font = useFont(require("@assets/fonts/SpaceGrotesk-Medium.ttf"));

  // Memoize chart data transformation
  const chartData = useMemo(
    () => [
      { percentile: 1, community: communityMetric.percentile1, player: playerMetric.percentile1 },
      { percentile: 5, community: communityMetric.percentile5, player: playerMetric.percentile5 },
      { percentile: 10, community: communityMetric.percentile10, player: playerMetric.percentile10 },
      { percentile: 25, community: communityMetric.percentile25, player: playerMetric.percentile25 },
      { percentile: 50, community: communityMetric.percentile50, player: playerMetric.percentile50 },
      { percentile: 75, community: communityMetric.percentile75, player: playerMetric.percentile75 },
      { percentile: 90, community: communityMetric.percentile90, player: playerMetric.percentile90 },
      { percentile: 95, community: communityMetric.percentile95, player: playerMetric.percentile95 },
      { percentile: 99, community: communityMetric.percentile99, player: playerMetric.percentile99 },
    ],
    [communityMetric, playerMetric],
  );

  // Memoize data range calculation
  const { minValue, maxValue } = useMemo(() => calculateDataRange(chartData), [chartData]);
  // Memoize axis options to prevent unnecessary re-renders
  const axisOptions = useMemo(
    () => ({
      font,
      lineColor: theme.colors.text,
      labelColor: theme.colors.text,
      formatXLabel: formatXAxisLabel,
      formatYLabel: (y: unknown) => formatYAxisLabel(y as number, minValue, maxValue),
    }),
    [font, theme.colors.text, minValue, maxValue],
  );

  return (
    <View style={themed($container)}>
      <CartesianChart data={chartData} xKey={"percentile"} yKeys={["community", "player"]} axisOptions={axisOptions}>
        {({ points }) => [
          <Line key="community" points={points.community} color={theme.colors.palette.failure500} strokeWidth={3} />,
          <Line key="player" points={points.player} color={theme.colors.tint} strokeWidth={3} />,
        ]}
      </CartesianChart>

      <Text size="xs" tx="performanceScreen:percentileLabel" style={$percentileLabel} />
    </View>
  );
});

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  margin: spacing.sm,
  marginTop: 40 + spacing.md,
});

const $percentileLabel: TextStyle = {
  textAlign: "center",
};

const $legend: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
  marginTop: spacing.xs,
  marginHorizontal: "auto",
});
