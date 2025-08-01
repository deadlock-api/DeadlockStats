import { useMemo } from "react";
import { ActivityIndicator, type TextStyle, View, type ViewStyle } from "react-native";
import { Text } from "@/components/ui/Text";
import { useMatchHistory } from "@/hooks/useMatchHistory";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import {
  calculateAverageMatchDuration,
  calculateAverageNetWorth,
  calculateKDA,
  calculateWinRate,
  filterLast30Days,
  getMostPlayedHeroes
} from "@/utils/matchHistoryStats";
import { StatisticCard } from "./StatisticCard";

export interface MatchHistoryStatsProps {
  /**
   * Steam ID of the player
   */
  steamId: number | null;
}

/**
 * Component that displays comprehensive match history statistics
 */
export function MatchHistoryStats(props: MatchHistoryStatsProps) {
  const { steamId } = props;
  const { themed, theme } = useAppTheme();

  const { data: matchHistoryData, isLoading, error } = useMatchHistory(steamId);

  // Use the match history data directly (now correctly typed as array)
  const allMatches = useMemo(() => {
    return matchHistoryData || [];
  }, [matchHistoryData]);

  // Calculate statistics for last 30 days
  const last30DaysMatches = useMemo(() => filterLast30Days(allMatches), [allMatches]);

  const stats = useMemo(() => {
    const winRate = calculateWinRate(last30DaysMatches);
    const kda = calculateKDA(last30DaysMatches);
    const avgNetWorth = calculateAverageNetWorth(last30DaysMatches);
    const avgDuration = calculateAverageMatchDuration(last30DaysMatches);
    const mostPlayedHeroes = getMostPlayedHeroes(last30DaysMatches);

    return {
      winRate,
      kda,
      avgNetWorth,
      avgDuration,
      mostPlayedHeroes,
      totalMatches: last30DaysMatches.length,
    };
  }, [last30DaysMatches]);

  if (isLoading) {
    return (
      <View style={themed($loadingContainer)}>
        <ActivityIndicator size="large" color={theme.colors.tint} />
        <Text text="Loading match history..." style={themed($loadingText)} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={themed($errorContainer)}>
        <Text text="Failed to load match history" preset="formHelper" style={themed($errorText)} />
      </View>
    );
  }

  if (stats.totalMatches === 0) {
    return (
      <View style={themed($emptyContainer)}>
        <Text text="No matches found in the last 30 days" preset="formHelper" style={themed($emptyText)} />
      </View>
    );
  }

  return (
    <View style={themed($container)}>
      {/* Section Title */}
      <Text text="Last 30 Days Statistics" preset="subheading" style={themed($sectionTitle)} />

      {/* Overview Statistics Row */}
      <View style={themed($statsRow)}>
        <StatisticCard
          title="Win Rate"
          value={`${stats.winRate}%`}
          valueColor={`rgb(${Math.round(255 - (Math.min(stats.winRate, 100) / 100) * 255)}, ${Math.round(
            (Math.min(stats.winRate, 100) / 100) * 255,
          )}, 0)`}
        />

        <StatisticCard title="Matches" value={stats.totalMatches} />

        <StatisticCard
          title="KDA Ratio"
          value={stats.kda.ratio}
          valueColor={`rgb(${Math.round(255 - (Math.min(stats.kda.ratio, 3) / 3) * 255)}, ${Math.round(
            (Math.min(stats.kda.ratio, 3) / 3) * 255,
          )}, 0)`}
        />
      </View>
    </View>
  );
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingVertical: spacing.md,
});

const $sectionTitle: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  color: colors.text,
  marginBottom: spacing.sm,
  marginTop: spacing.lg,
  textAlign: "center",
});

const $statsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "stretch",
  gap: spacing.md,
});

const $heroesContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "stretch",
  flexWrap: "wrap",
});

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
});

const $loadingText: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  color: colors.textDim,
});

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
});

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
  textAlign: "center",
});

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
});

const $emptyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
});
