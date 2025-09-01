import { useFont } from "@shopify/react-native-skia";
import type { HashMapValue } from "deadlock-api-client/api";
import React, { useMemo } from "react";
import { type TextStyle, View, type ViewStyle } from "react-native";
import { Text } from "src/components/ui/Text";
import { useAppTheme } from "src/theme/context";
import type { ThemedStyle } from "src/theme/types";
import {
  calculateDataRange,
  formatXAxisLabel,
  formatYAxisLabel,
  getCommunityPercentileRank,
  LOWER_IS_BETTER_NAMES,
} from "src/utils/performanceMetrics";
import { scaleColor } from "src/utils/scaleColor";
import { CartesianChart, Line } from "victory-native";

export interface PlayerVsCommunityChartProps {
  /**
   * Community metrics data
   */
  communityMetric: HashMapValue;
  /**
   * Player metrics data
   */
  playerMetric: HashMapValue;
  /**
   * Player account ID (currently unused but kept for future use)
   */
  accountId: number;
  /**
   * Metric name for display purposes
   */
  metricName: string;
}

export const PlayerVsCommunityChart = ({ communityMetric, playerMetric, metricName }: PlayerVsCommunityChartProps) => {
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
      formatYLabel: (y: unknown) => formatYAxisLabel(minValue, maxValue, y as number),
    }),
    [font, theme.colors.text, minValue, maxValue],
  );

  const isLowerIsBetter = LOWER_IS_BETTER_NAMES.has(metricName);
  const communityRank = getCommunityPercentileRank(playerMetric.avg, communityMetric, isLowerIsBetter);
  const formatStat = formatYAxisLabel.bind(undefined, minValue, maxValue);

  return (
    <View style={themed($container)}>
      <CartesianChart data={chartData} xKey={"percentile"} yKeys={["community", "player"]} axisOptions={axisOptions}>
        {({ points }) => [
          <Line key="community" points={points.community} color={theme.colors.palette.failure500} strokeWidth={3} />,
          <Line key="player" points={points.player} color={theme.colors.tint} strokeWidth={3} />,
        ]}
      </CartesianChart>

      <Text size="xs" tx="performanceScreen:percentileLabel" style={$percentileLabel} />

      <View
        style={{
          marginTop: theme.spacing.md,
          gap: theme.spacing.xs,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: theme.spacing.sm,
          }}
        >
          <View style={{ flexDirection: "column", alignItems: "center", width: "30%", minWidth: 90 }}>
            <Text size="xs" style={{ color: theme.colors.tint, fontWeight: "bold", fontSize: 16 }}>
              You
            </Text>
            <Text style={{ color: theme.colors.text }}>{formatStat(playerMetric.avg)}</Text>
            <Text style={{ color: theme.colors.text }}>{formatStat(playerMetric.std)}</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center" }}>
            <Text size="xs" style={{ color: theme.colors.palette.failure500, fontWeight: "bold", fontSize: 16 }}></Text>
            <Text style={{ color: theme.colors.textDim }}>AVG</Text>
            <Text style={{ color: theme.colors.textDim }}>STD</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", width: "30%", minWidth: 90 }}>
            <Text size="xs" style={{ color: theme.colors.palette.failure500, fontWeight: "bold", fontSize: 16 }}>
              Community
            </Text>
            <Text style={{ color: theme.colors.text }}>{formatStat(communityMetric.avg)}</Text>
            <Text style={{ color: theme.colors.text }}>{formatStat(communityMetric.std)}</Text>
          </View>
        </View>

        <Text
          size="xs"
          style={{
            fontWeight: "bold",
            fontSize: 16,
            textAlign: "center",
          }}
        >
          You are in the Top{" "}
          <Text style={{ color: scaleColor(communityRank, 0, 100) }}>{(100 - communityRank).toFixed(0)}%</Text> of the
          community
        </Text>
      </View>
    </View>
  );
};

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  margin: spacing.sm,
  marginTop: 40 + spacing.md,
});

const $percentileLabel: TextStyle = {
  textAlign: "center",
};
