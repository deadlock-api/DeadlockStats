import { type FC, useMemo } from "react";
import { ActivityIndicator, View, type ViewStyle } from "react-native";
import { usePlayerSelected, useTimeRangeSelected } from "@/app";
import { HeroImage } from "@/components/heroes/HeroImage";
import { HeroName } from "@/components/heroes/HeroName";
import { MatchList } from "@/components/matches/MatchList";
import { StatCard } from "@/components/profile/StatCard";
import { TimeRangeSelect } from "@/components/select/TimeRangeSelect";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useAssetsHero } from "@/hooks/useAssetsHeroes";
import { useHeroStats } from "@/hooks/useHeroStats";
import { useMatchHistory } from "@/hooks/useMatchHistory";
import type { HeroesStackScreenProps } from "@/navigators/HeroesNavigator";
import type { HeroStats } from "@/services/api/types/hero_stats";
import type { MatchHistory } from "@/services/api/types/match_history";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { formatRelativeTime, formatTimePlayed } from "@/utils/matchHistoryStats";
import { scaleColor } from "@/utils/scaleColor";

export const HeroDetailsScreen: FC<HeroesStackScreenProps<"Details">> = (props) => {
  const { themed, theme } = useAppTheme();

  const [timeRange] = useTimeRangeSelected();
  const now = Math.floor(Date.now() / 1000);
  const nextFullHour = Math.ceil(now / 3600) * 3600;
  const minUnixTimestamp = timeRange.value ? nextFullHour - timeRange.value : 0;

  const [player] = usePlayerSelected();

  const heroId = props.route.params.heroId;

  const { data: heroAsset, isLoading: isHeroLoading } = useAssetsHero(heroId);
  const { data: heroStatsAll, isLoading: isHeroStatsLoading } = useHeroStats(
    player?.account_id ?? null,
    minUnixTimestamp,
  );
  const { data: matchHistory, isLoading: isMatchHistoryLoading } = useMatchHistory(player?.account_id ?? null);

  const heroStat: HeroStats | undefined = useMemo(
    () => heroStatsAll?.find((h) => h.hero_id === heroId),
    [heroId, heroStatsAll],
  );

  const heroMatches: MatchHistory[] = useMemo(
    () =>
      (matchHistory ?? [])
        .filter((m) => !minUnixTimestamp || m.start_time >= minUnixTimestamp)
        .filter((m) => m.hero_id === heroId)
        .sort((a, b) => b.start_time - a.start_time),
    [minUnixTimestamp, matchHistory, heroId],
  );

  const isLoading = isHeroLoading || isHeroStatsLoading || isMatchHistoryLoading;

  const header = (
    <>
      <TimeRangeSelect />
      <View style={themed($heroHeaderRow)}>
        <HeroImage heroId={heroId} size={50} />
        <View style={{ justifyContent: "center", gap: theme.spacing.xs }}>
          <Text numberOfLines={1} preset="subheading" style={{ color: theme.colors.text, lineHeight: 16 }}>
            <HeroName heroId={heroId} />
          </Text>
          {heroAsset?.description?.role && (
            <Text numberOfLines={2} style={{ color: theme.colors.textDim, fontSize: 14 }}>
              {heroAsset?.description.role}
            </Text>
          )}
        </View>
      </View>
    </>
  );

  if (isLoading) {
    return (
      <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$styles.container}>
        {header}
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={theme.colors.tint} />
          <Text preset="subheading" style={{ marginTop: theme.spacing.md }}>
            Loading hero details…
          </Text>
        </View>
      </Screen>
    );
  }

  if (!heroAsset || !heroStat) {
    return (
      <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$styles.container}>
        {header}
        <View style={themed($errorContainer)}>
          <Text style={{ marginTop: theme.spacing.sm, textAlign: "center" }}>
            We couldn't find any data for this hero. Please try again or change the time range.
          </Text>
        </View>
      </Screen>
    );
  }

  const winrate = Math.round((100 * heroStat.wins) / Math.max(1, heroStat.matches_played));
  const avgKills = Math.round(heroStat.kills / Math.max(1, heroStat.matches_played)).toFixed(0);
  const avgDeaths = Math.round(heroStat.deaths / Math.max(1, heroStat.matches_played)).toFixed(0);
  const avgAssists = Math.round(heroStat.assists / Math.max(1, heroStat.matches_played)).toFixed(0);
  const avgKd = Math.round((10 * (heroStat.kills + heroStat.assists)) / Math.max(1, heroStat.deaths || 1)) / 10;
  const avgDmg = Math.round(heroStat.damage_per_min);
  const avgDmgTaken = Math.round(heroStat.damage_taken_per_min);
  const avgObjDmg = Math.round(heroStat.obj_damage_per_min);
  const lastPlayed = formatRelativeTime(heroStat.last_played);
  const timePlayed = formatTimePlayed(heroStat.time_played);

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$styles.container}>
      {header}
      <View style={themed($stats)}>
        <StatCard width="40%" title="Last Played" value={lastPlayed} />
        <StatCard width="40%" title="Playtime" value={timePlayed} />
        <StatCard
          width="30%"
          title="Winrate"
          value={`${winrate}%`}
          valueChange={2 * heroStat.wins - heroStat.matches_played}
          valueColor={scaleColor(winrate, 30, 70)}
        />
        <StatCard
          width="30%"
          title="KDA"
          value={`${avgKills}/${avgDeaths}/${avgAssists}`}
          valueColor={scaleColor(avgKd, 0.5, 4)}
        />
        <StatCard
          width="30%"
          title="Accuracy"
          value={`${Math.round(100 * heroStat.accuracy).toFixed(0)}%`}
          valueColor={scaleColor(heroStat.accuracy, 0.4, 0.7)}
        />
        <StatCard
          width="30%"
          title="Crit Rate"
          value={`${Math.round(100 * heroStat.crit_shot_rate).toFixed(0)}%`}
          valueColor={scaleColor(heroStat.crit_shot_rate, 0.06, 0.23)}
        />
        <StatCard
          width="30%"
          unit="min"
          title="Last Hits"
          value={heroStat.last_hits_per_min.toFixed(2)}
          valueColor={scaleColor(heroStat.last_hits_per_min, 2.2, 6.2)}
        />
        <StatCard
          width="30%"
          unit="min"
          title="Networth"
          value={heroStat.networth_per_min.toFixed(0)}
          valueColor={scaleColor(heroStat.networth_per_min, 740, 1440)}
        />
        <StatCard width="30%" unit="min" title="Ply. Dmg" value={avgDmg} valueColor={scaleColor(avgDmg, 290, 1240)} />
        <StatCard
          width="30%"
          unit="min"
          title="Dmg Taken"
          value={avgDmgTaken}
          valueColor={scaleColor(avgDmgTaken, 1240, 290)}
        />
        <StatCard
          width="30%"
          unit="min"
          title="Obj. Dmg"
          value={avgObjDmg}
          valueColor={scaleColor(avgObjDmg, 0, 1000)}
        />
      </View>

      <View style={{ marginTop: theme.spacing.md }}>
        <Text preset="subheading" tx="heroDetailsScreen:heroMatches" />
      </View>
      <MatchList matches={heroMatches} />
    </Screen>
  );
};

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
});

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
});

const $heroHeaderRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  borderRadius: 12,
  marginTop: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
});

const $stats: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: spacing.sm,
  marginTop: spacing.md,
});
