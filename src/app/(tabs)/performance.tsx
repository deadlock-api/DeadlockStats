import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import { type SceneRendererProps, TabView } from "reanimated-tab-view";
import { usePlayerSelected, useTimeRangeSelected } from "src/app/_layout";
import { PlayerVsCommunityChart } from "src/components/performance/PlayerVsCommunityChart";
import { TimeRangeSelect } from "src/components/select/TimeRangeSelect";
import { ErrorMessage } from "src/components/shared/ErrorMessage";
import { LoadingIndicator } from "src/components/shared/LoadingIndicator";
import { Card } from "src/components/ui/Card";
import { Screen } from "src/components/ui/Screen";
import { Text } from "src/components/ui/Text";
import { usePerformanceMetrics } from "src/hooks/usePerformanceMetrics";
import { useAppTheme } from "src/theme/context";
import { $styles } from "src/theme/styles";

// Configure reanimated logger to reduce noise
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const NAMES_MAP: Record<string, string> = {
  accuracy: "Accuracy",
  assists: "Assists",
  boss_damage: "Boss Dmg",
  boss_damage_per_min: "Boss Dmg/min",
  crit_shot_rate: "Crit Rate",
  deaths: "Deaths",
  denies: "Denies",
  healing: "Healing",
  healing_per_min: "Heal/min",
  kd: "K/D",
  kda: "KDA",
  kills: "Kills",
  kills_plus_assists: "Kill-Participation",
  last_hits: "Last Hits",
  net_worth: "Net Worth",
  net_worth_per_min: "Net/min",
  neutral_damage: "Neutral Dmg",
  neutral_damage_per_min: "Neutral Dmg/min",
  player_damage: "Player Dmg",
  player_damage_per_health: "Dmg/Health",
  player_damage_per_min: "Player Dmg/min",
  player_damage_taken_per_min: "Dmg Taken/min",
  player_healing: "Player Heal",
  player_healing_per_min: "Player Heal/min",
  self_healing: "Self Heal",
  self_healing_per_min: "Self Heal/min",
};

/**
 * Performance screen component with optimized data loading and error handling
 */
export default function PerformanceScreen() {
  const { theme } = useAppTheme();
  const [timeRange] = useTimeRangeSelected();
  const [player] = usePlayerSelected();

  const now = Math.floor(Date.now() / 1000);
  const nextFullHour = Math.ceil(now / 3600) * 3600;
  const minUnixTimestamp = timeRange.value ? nextFullHour - timeRange.value : 0;
  const [index, setIndex] = useState(0);
  const queryClient = useQueryClient();

  const routes = Object.entries(NAMES_MAP)
    .map(([key, name]) => ({ key, title: name }))
    .sort((a, b) => a.title.localeCompare(b.title));

  // Use custom hook for performance metrics management
  const { isLoading, hasError, communityStatsMetrics, playerStatsMetrics, refetch } = usePerformanceMetrics(
    player?.account_id,
    minUnixTimestamp,
  );

  // Memoize refresh callback to prevent unnecessary re-renders
  const onRefreshing = useCallback(async () => await queryClient.refetchQueries({ type: "active" }), [queryClient]);

  // Memoize error retry handler
  const handleRetry = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Failed to retry loading performance metrics:", error);
    }
  }, [refetch]);

  // Memoize scene renderer to prevent unnecessary re-renders
  const renderScene = useCallback(
    (props: SceneRendererProps) => {
      console.log("rendering scene", props.route.key);
      // Show loading state
      if (isLoading) return <LoadingIndicator messageTx="performanceScreen:loadingMetrics" />;

      // Show error state
      if (hasError) {
        return (
          <ErrorMessage
            titleTx="performanceScreen:errorTitle"
            messageTx="performanceScreen:errorMessage"
            retryTx="performanceScreen:retryLoading"
            onRetry={handleRetry}
          />
        );
      }

      // Get metrics for current route
      const communityMetric = communityStatsMetrics?.[props.route.key];
      const playerMetric = playerStatsMetrics?.[props.route.key];

      // Show no data state
      if (!communityMetric || !playerMetric || !player?.account_id) {
        return (
          <ErrorMessage
            messageTx="performanceScreen:noDataAvailable"
            retryTx="performanceScreen:retryLoading"
            onRetry={handleRetry}
          />
        );
      }

      // Render chart component
      return (
        <PlayerVsCommunityChart
          accountId={player.account_id}
          communityMetric={communityMetric}
          playerMetric={playerMetric}
        />
      );
    },
    [isLoading, hasError, communityStatsMetrics, playerStatsMetrics, player?.account_id, handleRetry],
  );

  // Memoize index change handler
  const handleIndexChange = useCallback((newIndex: number) => {
    setIndex(newIndex);
  }, []);

  // Early return for no player selected
  if (!player) {
    return (
      <Screen preset="scroll" contentContainerStyle={$styles.containerWithHeader}>
        <ErrorMessage titleTx="performanceScreen:noPlayerSelected" messageTx="common:linkSteamAccount" />
      </Screen>
    );
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$styles.containerWithHeader} onRefreshing={onRefreshing}>
      <TimeRangeSelect />
      <Card style={{ height: 400 }}>
        <View style={{ flex: 1, gap: theme.spacing.sm }}>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: theme.spacing.sm }}>
            <Text preset="subheading" tx="performanceScreen:playerLabel" style={[{ color: theme.colors.tint }]} />
            <Text preset="subheading" text="vs" />
            <Text
              preset="subheading"
              tx="performanceScreen:communityLabel"
              style={[{ color: theme.colors.palette.failure500 }]}
            />
          </View>
          <TabView
            renderMode="windowed"
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={handleIndexChange}
            swipeEnabled
            tabBarConfig={{
              tabBarScrollEnabled: true,
              tabBarDynamicWidthEnabled: true,
              tabBarStyle: {
                borderRadius: theme.spacing.md,
                backgroundColor: theme.colors.palette.neutral300,
                height: 40,
              },
              tabBarIndicatorStyle: {
                backgroundColor: theme.colors.tint,
                borderRadius: theme.spacing.md,
                height: "100%",
              },
              tabStyle: {
                height: 40,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xxxs,
              },
              tabLabelStyle: {
                color: theme.colors.text,
                paddingHorizontal: theme.spacing.xxxs,
              },
            }}
            keyboardDismissMode="on-drag"
          />
        </View>
      </Card>
    </Screen>
  );
}
