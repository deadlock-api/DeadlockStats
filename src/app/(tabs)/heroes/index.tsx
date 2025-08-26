import { useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, type TextStyle, View, type ViewStyle } from "react-native";
import { usePlayerSelected, useTimeRangeSelected } from "src/app/_layout";
import { HeroImage } from "src/components/heroes/HeroImage";
import { HeroName } from "src/components/heroes/HeroName";
import { StatItem } from "src/components/matches/StatItem";
import { TimeRangeSelect } from "src/components/select/TimeRangeSelect";
import { Card } from "src/components/ui/Card";
import { Screen } from "src/components/ui/Screen";
import { Text } from "src/components/ui/Text";
import { useHeroStats } from "src/hooks/useHeroStats";

import type { HeroStats } from "src/services/api/types/hero_stats";
import { useAppTheme } from "src/theme/context";
import { $styles } from "src/theme/styles";
import type { ThemedStyle } from "src/theme/types";
import { formatRelativeTime, formatTimePlayed } from "src/utils/matchHistoryStats";
import { scaleColor } from "src/utils/scaleColor";
import { hasSteamId } from "src/utils/steamAuth";

export default function HeroesStats() {
  const [timeRange] = useTimeRangeSelected();
  const [player] = usePlayerSelected();

  const now = Math.floor(Date.now() / 1000);
  const nextFullHour = Math.ceil(now / 3600) * 3600;
  const minUnixTimestamp = timeRange.value ? nextFullHour - timeRange.value : 0;
  let { data: heroStats, isLoading } = useHeroStats(player?.account_id ?? null, minUnixTimestamp);
  heroStats = heroStats
    ?.filter((heroStat) => heroStat.matches_played > 0)
    .sort((a, b) => b.last_played - a.last_played);

  const queryClient = useQueryClient();
  const onRefreshing = useCallback(
    async () =>
      await queryClient.refetchQueries({ queryKey: ["api-hero-stats", player?.account_id ?? null, minUnixTimestamp] }),
    [queryClient, player?.account_id, minUnixTimestamp],
  );
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefreshing();
    setRefreshing(false);
  }, [onRefreshing]);

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.containerWithHeader}>
      <TimeRangeSelect />

      {heroStats && heroStats.length > 0 ? (
        <FlatList
          data={heroStats}
          renderItem={({ item }) => (
            <Link href={`/(tabs)/heroes/${item.hero_id}`} asChild>
              <HeroStatItem heroStat={item} />
            </Link>
          )}
          ListEmptyComponent={() => (
            <View style={{ alignItems: "center", justifyContent: "center", padding: 16 }}>
              <Text tx="heroesStatsScreen:noHeroStatsFound" />
            </View>
          )}
          keyExtractor={(i) => i.hero_id.toString()}
          maxToRenderPerBatch={20}
          initialNumToRender={10}
          windowSize={10}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : isLoading ? (
        <View style={{ alignItems: "center", justifyContent: "center", padding: 16 }}>
          <ActivityIndicator size="large" />
          <Text tx="heroesStatsScreen:loadingHeroStats" />
        </View>
      ) : (
        <View style={{ alignItems: "center", justifyContent: "center", padding: 16 }}>
          <Text tx={!hasSteamId() ? "heroesStatsScreen:noSteamAccountLinked" : "heroesStatsScreen:noHeroStatsFound"} />
        </View>
      )}
    </Screen>
  );
}

const HeroStatItem = ({ heroStat, onPress }: { heroStat: HeroStats; onPress?: () => void }) => {
  const { themed, theme } = useAppTheme();

  const winrate = Math.round((100 * heroStat.wins) / heroStat.matches_played);
  const avgKills = Math.round((10 * heroStat.kills) / heroStat.matches_played) / 10;
  const avgDeaths = Math.round((10 * heroStat.deaths) / heroStat.matches_played) / 10;
  const avgAssists = Math.round((10 * heroStat.assists) / heroStat.matches_played) / 10;
  const avgKd = Math.round((10 * (heroStat.kills + heroStat.assists)) / heroStat.deaths) / 10;
  const lastPlayed = formatRelativeTime(heroStat.last_played);
  const timePlayed = formatTimePlayed(heroStat.time_played);

  return (
    <Card style={themed($heroStats)} onPress={onPress}>
      <View style={themed($heroStatTopRow)}>
        <View style={themed($heroStatsTopRowLeft)}>
          <HeroImage heroId={heroStat.hero_id} size={40} />
          <View>
            <Text numberOfLines={1} style={themed($heroNameText)} size="sm">
              <HeroName heroId={heroStat.hero_id} />
            </Text>
          </View>
        </View>
        <View style={themed($heroStatsTopRowRight)}>
          <Text style={{ color: theme.colors.textDim }} size="xxs">
            {timePlayed} playtime
          </Text>
          <Text style={{ color: theme.colors.textDim }} size="xxs">
            {lastPlayed} last
          </Text>
        </View>
      </View>
      <View style={themed($heroStatsContent)}>
        <StatItem label="Games" value={heroStat.matches_played} />
        <StatItem label="Winrate" value={`${winrate}%`} valueColor={scaleColor(winrate, 30, 70)} />
        <StatItem
          label="KDA"
          value={`${avgKills.toFixed(1)}/${avgDeaths.toFixed(1)}/${avgAssists.toFixed(1)}`}
          valueColor={scaleColor(avgKd, 0.5, 4)}
        />
        <StatItem
          label="Accuracy"
          value={`${Math.round(100 * heroStat.accuracy)}%`}
          valueColor={scaleColor(heroStat.accuracy, 0.45, 0.7)}
        />
      </View>
    </Card>
  );
};

const $heroStats: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.xs,
  marginVertical: spacing.xxs,
});

const $heroStatTopRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
});

const $heroStatsTopRowLeft: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
});

const $heroStatsTopRowRight: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "column",
  justifyContent: "space-around",
  alignItems: "flex-end",
  gap: spacing.xxs,
});

const $heroStatsContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-evenly",
  flexWrap: "wrap",
  gap: spacing.sm,
  marginTop: spacing.sm,
});

const $heroNameText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
});
