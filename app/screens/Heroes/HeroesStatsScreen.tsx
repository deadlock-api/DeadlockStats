import type { FC } from "react";
import { ActivityIndicator, ScrollView, type TextStyle, View, type ViewStyle } from "react-native";
import { usePlayerSelected, useTimeRangeSelected } from "@/app";
import { HeroDescriptionRole } from "@/components/heroes/HeroDescriptionRole";
import { HeroImage } from "@/components/heroes/HeroImage";
import { HeroName } from "@/components/heroes/HeroName";
import { AccountSelector } from "@/components/profile/AccountSelector";
import { TimeRangeSelect } from "@/components/select/TimeRangeSelect";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useHeroStats } from "@/hooks/useHeroStats";
import type { HeroesStackScreenProps } from "@/navigators/HeroesNavigator";
import type { HeroStats } from "@/services/api/types/hero_stats";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { formatRelativeTime } from "@/utils/matchHistoryStats";
import { scaleColor } from "@/utils/scaleColor";
import { hasSteamId } from "@/utils/steamAuth";

export const HeroesStatsScreen: FC<HeroesStackScreenProps<"Stats">> = () => {
  const { themed } = useAppTheme();

  const [timeRange, _1] = useTimeRangeSelected();
  const [player, _2] = usePlayerSelected();

  const now = Math.floor(Date.now() / 1000);
  const nextFullHour = Math.ceil(now / 3600) * 3600;
  const minUnixTimestamp = timeRange.value ? nextFullHour - timeRange.value : null;
  let { data: heroStats, isLoading } = useHeroStats(player?.account_id ?? null, minUnixTimestamp);
  heroStats = heroStats
    ?.filter((heroStat) => heroStat.matches_played > 0)
    .sort((a, b) => b.last_played - a.last_played);

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.container}>
      <AccountSelector />
      <TimeRangeSelect />

      {heroStats && heroStats.length > 0 ? (
        <ScrollView style={themed($heroesContainer)}>
          {heroStats.map((h) => (
            <HeroStatItem key={h.hero_id} heroStat={h} />
          ))}
        </ScrollView>
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
};

const $heroesContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "column",
  gap: spacing.lg,
});

const HeroStatItem = ({ heroStat }: { heroStat: HeroStats }) => {
  const { themed, theme } = useAppTheme();

  const winrate = Math.round((100 * heroStat.wins) / heroStat.matches_played);
  const avgKills = Math.round((10 * heroStat.kills) / heroStat.matches_played) / 10;
  const avgDeaths = Math.round((10 * heroStat.deaths) / heroStat.matches_played) / 10;
  const avgAssists = Math.round((10 * heroStat.assists) / heroStat.matches_played) / 10;
  const avgKd = Math.round((10 * (heroStat.kills + heroStat.assists)) / heroStat.deaths) / 10;
  const lastPlayed = formatRelativeTime(heroStat.last_played);

  return (
    <View style={themed($heroStats)}>
      <View style={themed($heroStatTopRow)}>
        <HeroImage heroId={heroStat.hero_id} size={40} />
        <View style={themed($heroesNameContainer)}>
          <Text numberOfLines={1} style={themed($heroNameText)}>
            <HeroName heroId={heroStat.hero_id} />
          </Text>
          <Text numberOfLines={2} style={themed($heroRoleText)}>
            <HeroDescriptionRole heroId={heroStat.hero_id} />
          </Text>
        </View>
      </View>
      <View style={themed($heroStatsContent)}>
        <View style={themed($heroStatsContentStat)}>
          <Text>Games Played</Text>
          <Text>{heroStat.matches_played}</Text>
        </View>
        <View style={themed($heroStatsContentStat)}>
          <Text>Win Rate</Text>
          <Text style={{ color: scaleColor(winrate, 30, 70) }}>{winrate}%</Text>
        </View>
        <View style={themed($heroStatsContentStat)}>
          <Text>KDA</Text>
          <Text style={{ color: scaleColor(avgKd, 0.5, 4) }}>
            {avgKills}/{avgDeaths}/{avgAssists}
          </Text>
        </View>
        <View style={themed($heroStatsContentStat)}>
          <Text>Accuracy</Text>
          <Text style={{ color: scaleColor(heroStat.accuracy, 0.45, 0.7) }}>
            {Math.round(100 * heroStat.accuracy)}%
          </Text>
        </View>
        <View style={themed($heroStatsContentStat)}>
          <Text>Headshot Rate</Text>
          <Text style={{ color: scaleColor(heroStat.crit_shot_rate, 0.08, 0.22) }}>
            {Math.round(100 * heroStat.crit_shot_rate)}%
          </Text>
        </View>
      </View>
      <View style={themed($heroStatsBottomRow)}>
        <Text style={{ color: theme.colors.textDim, fontSize: 13 }}>Last played {lastPlayed}</Text>
      </View>
    </View>
  );
};

const $heroStats: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.sm,
  marginVertical: spacing.xxs,
  elevation: 1,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
});

const $heroStatTopRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
});

const $heroStatsBottomRow: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  borderTopWidth: 1,
  borderTopColor: colors.border,
  paddingTop: spacing.xs,
});

const $heroStatsContent: ThemedStyle<ViewStyle> = () => ({});

const $heroStatsContentStat: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: spacing.md,
});

const $heroesNameContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.xxs,
  justifyContent: "center",
});

const $heroNameText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.semiBold,
  lineHeight: 16,
});

const $heroRoleText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  lineHeight: 14,
});
