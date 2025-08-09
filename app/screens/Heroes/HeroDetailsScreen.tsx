import { type FC, useCallback, useMemo } from "react";
import { ActivityIndicator, FlatList, type TextStyle, View, type ViewStyle } from "react-native";
import { usePlayerSelected, useTimeRangeSelected } from "@/app";
import { HeroImage } from "@/components/heroes/HeroImage";
import { HeroName } from "@/components/heroes/HeroName";
import { MatchItem } from "@/components/matches/MatchItem";
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

  const onPressMatch = useCallback(
    (match: MatchHistory) =>
      (props.navigation as any).navigate("MainMatches", { screen: "Details", params: { matchId: match.match_id } }),
    [props.navigation],
  );

  if (isLoading) {
    return (
      <Screen preset="fixed" contentContainerStyle={$styles.container}>
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
      <Screen preset="fixed" contentContainerStyle={$styles.container}>
        <View style={themed($errorContainer)}>
          <Text preset="heading" style={{ color: theme.colors.error }}>
            Hero data unavailable
          </Text>
          <Text style={{ marginTop: theme.spacing.sm, textAlign: "center" }}>
            We couldn't load data for this hero. Please try again later.
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
  const avgObjDmg = Math.round(heroStat.obj_damage_per_min);

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$styles.container}>
      <TimeRangeSelect />

      <View style={themed($headerCard)}>
        <View style={themed($heroHeaderRow)}>
          <HeroImage heroId={heroId} size={50} />
          <View style={{ flex: 1, justifyContent: "center", gap: theme.spacing.xs }}>
            <Text numberOfLines={1} preset="subheading" style={{ color: theme.colors.text, lineHeight: 18 }}>
              <HeroName heroId={heroId} />
            </Text>
            {!!heroAsset.description?.role && (
              <Text numberOfLines={2} style={{ color: theme.colors.textDim, lineHeight: 14 }}>
                {heroAsset.description.role}
              </Text>
            )}
          </View>
        </View>
        <View style={themed($statsRow)}>
          <StatCard width="48%" title="Games" value={heroStat.matches_played} />
          <StatCard width="48%" title="WR" value={`${winrate}%`} valueColor={scaleColor(winrate, 30, 70)} />
          <StatCard
            width="48%"
            title="KDA"
            value={`${avgKills}/${avgDeaths}/${avgAssists}`}
            valueColor={scaleColor(avgKd, 0.5, 4)}
          />
          <StatCard
            width="48%"
            title="KDA/10min"
            value={`${(Math.round(heroStat.kills_per_min * 100) / 10).toFixed(0)}/${(Math.round(heroStat.deaths_per_min * 100) / 10).toFixed(0)}/${(Math.round(heroStat.assists_per_min * 100) / 10).toFixed(0)}`}
          />
          <StatCard width="48%" title="Ply. Dmg/min" value={avgDmg} />
          <StatCard width="48%" title="Obj. Dmg/min" value={avgObjDmg} />
          <StatCard width="48%" title="Accuracy" value={`${Math.round(100 * heroStat.accuracy).toFixed(0)}%`} />
          <StatCard width="48%" title="Crit Rate" value={`${Math.round(100 * heroStat.crit_shot_rate).toFixed(0)}%`} />
        </View>
      </View>

      <View style={themed($listHeader)}>
        <Text preset="subheading" tx="heroDetailsScreen:heroMatches" />
      </View>
      <View style={themed($listCard)}>
        {heroMatches.length === 0 ? (
          <View style={themed($emptyContainer)}>
            <Text style={{ color: theme.colors.textDim }}>No matches with this hero yet.</Text>
          </View>
        ) : (
          <FlatList
            data={heroMatches}
            maxToRenderPerBatch={20}
            initialNumToRender={5}
            windowSize={6}
            renderItem={({ item }) => <MatchItem match={item} onPress={onPressMatch} />}
            keyExtractor={(item) => item.match_id.toString()}
            scrollEnabled={false}
          />
        )}
      </View>
    </Screen>
  );
};

const StatBox = ({ label, value, valueColor }: { label: string; value: string | number; valueColor?: string }) => {
  const { themed } = useAppTheme();
  return (
    <View style={themed($statBox)}>
      <Text numberOfLines={1} style={themed($statLabel)}>
        {label}
      </Text>
      <Text numberOfLines={1} style={[themed($statValue), valueColor && { color: valueColor }]}>
        {value}
      </Text>
    </View>
  );
};

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
});

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
});

const $headerCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  borderRadius: 12,
  gap: spacing.sm,
  marginTop: spacing.lg,
});

const $heroHeaderRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
});

const $statsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: spacing.sm,
});

const $statBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "30%",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 10,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
});

const $statLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 12,
  lineHeight: 14,
});

const $statValue: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: 14,
  lineHeight: 16,
  fontFamily: typography.primary.semiBold,
});

const $listCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  borderRadius: 12,
  gap: spacing.xs,
});

const $listHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: spacing.md,
});

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.md,
});
