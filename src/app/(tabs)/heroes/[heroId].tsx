import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, View, type ViewStyle } from "react-native";
import { usePlayerSelected, useTimeRangeSelected } from "src/app/_layout";
import { HeroImage } from "src/components/heroes/HeroImage";
import { HeroName } from "src/components/heroes/HeroName";
import { MatchList } from "src/components/matches/MatchList";
import { StatCard } from "src/components/profile/StatCard";
import { TimeRangeSelect } from "src/components/select/TimeRangeSelect";
import { Screen } from "src/components/ui/Screen";
import { Text } from "src/components/ui/Text";
import { useAssetsHero } from "src/hooks/useAssetsHeroes";
import { useHeroStats } from "src/hooks/useHeroStats";
import { useMatchHistory } from "src/hooks/useMatchHistory";
import type { HeroStats } from "src/services/api/types/hero_stats";
import type { MatchHistory } from "src/services/api/types/match_history";
import { useAppTheme } from "src/theme/context";
import { $styles } from "src/theme/styles";
import type { ThemedStyle } from "src/theme/types";
import { formatRelativeTime, formatTimePlayed } from "src/utils/matchHistoryStats";
import { scaleColor } from "src/utils/scaleColor";

export default function HeroDetails() {
  const router = useRouter();
  const { heroId } = useLocalSearchParams<{ heroId: string }>();
  const { themed, theme } = useAppTheme();

  const [timeRange] = useTimeRangeSelected();
  const now = Math.floor(Date.now() / 1000);
  const nextFullHour = Math.ceil(now / 3600) * 3600;
  const minUnixTimestamp = timeRange.value ? nextFullHour - timeRange.value : 0;

  const [player] = usePlayerSelected();

  const heroIdNumber = Number(heroId);

  const { data: heroAsset, isLoading: isHeroLoading } = useAssetsHero(heroIdNumber);
  const { data: heroStatsAll, isLoading: isHeroStatsLoading } = useHeroStats(
    player?.account_id ?? null,
    minUnixTimestamp,
  );
  const { data: matchHistory, isLoading: isMatchHistoryLoading } = useMatchHistory(player?.account_id ?? null);

  const heroStat: HeroStats | undefined = useMemo(
    () => heroStatsAll?.find((h) => h.hero_id === heroIdNumber),
    [heroIdNumber, heroStatsAll],
  );

  const heroMatches: MatchHistory[] = useMemo(
    () =>
      (matchHistory ?? [])
        .filter((m) => !minUnixTimestamp || m.start_time >= minUnixTimestamp)
        .filter((m) => m.hero_id === heroIdNumber)
        .sort((a, b) => b.start_time - a.start_time),
    [minUnixTimestamp, matchHistory, heroIdNumber],
  );

  const isLoading = isHeroLoading || isHeroStatsLoading || isMatchHistoryLoading;

  const header = (
    <>
      <TimeRangeSelect />
      <View style={themed($heroHeaderRow)}>
        <HeroImage heroId={heroIdNumber} size={50} />
        <View style={{ justifyContent: "center", gap: theme.spacing.xs }}>
          <Text numberOfLines={1} preset="subheading" style={{ color: theme.colors.text, lineHeight: 16 }}>
            <HeroName heroId={heroIdNumber} />
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
      <Screen preset="scroll" contentContainerStyle={$styles.containerWithHeader}>
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
      <Screen preset="scroll" contentContainerStyle={$styles.containerWithHeader}>
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
    <Screen preset="scroll" contentContainerStyle={$styles.containerWithHeader}>
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
      <MatchList
        matches={heroMatches}
        onPress={(matchId) => router.navigate(`/(tabs)/matches/${matchId}`, { withAnchor: true })}
      />
    </Screen>
  );
}

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
