import { FontAwesome6 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { FC } from "react";
import { ActivityIndicator, ScrollView, type TextStyle, TouchableOpacity, View, type ViewStyle } from "react-native";
import { usePlayerSelected, useTimeRangeSelected } from "@/app";
import { HeroImage } from "@/components/heroes/HeroImage";
import { HeroName } from "@/components/heroes/HeroName";
import { TimeRangeSelect } from "@/components/select/TimeRangeSelect";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useHeroStats } from "@/hooks/useHeroStats";
import type { HeroesStackScreenProps } from "@/navigators/HeroesNavigator";
import type { HeroStats } from "@/services/api/types/hero_stats";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { formatRelativeTime, formatTimePlayed } from "@/utils/matchHistoryStats";
import { scaleColor } from "@/utils/scaleColor";
import { hasSteamId } from "@/utils/steamAuth";

export const HeroesStatsScreen: FC<HeroesStackScreenProps<"Stats">> = () => {
  const { themed } = useAppTheme();
  const navigator = useNavigation();

  const [timeRange, _1] = useTimeRangeSelected();
  const [player, _2] = usePlayerSelected();

  const now = Math.floor(Date.now() / 1000);
  const nextFullHour = Math.ceil(now / 3600) * 3600;
  const minUnixTimestamp = timeRange.value ? nextFullHour - timeRange.value : 0;
  let { data: heroStats, isLoading } = useHeroStats(player?.account_id ?? null, minUnixTimestamp);
  heroStats = heroStats
    ?.filter((heroStat) => heroStat.matches_played > 0)
    .sort((a, b) => b.last_played - a.last_played);

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$styles.container}>
      <TimeRangeSelect />

      {heroStats && heroStats.length > 0 ? (
        <ScrollView style={themed($heroesContainer)}>
          {heroStats.map((h) => (
            <TouchableOpacity
              key={h.hero_id}
              onPress={() => navigator.navigate("MainHeroes", { screen: "Details", params: { heroId: h.hero_id } })}
            >
              <HeroStatItem heroStat={h} />
            </TouchableOpacity>
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
  const navigation = useNavigation();
  const navigateAny: any = navigation as any;

  const winrate = Math.round((100 * heroStat.wins) / heroStat.matches_played);
  const avgKills = Math.round((10 * heroStat.kills) / heroStat.matches_played) / 10;
  const avgDeaths = Math.round((10 * heroStat.deaths) / heroStat.matches_played) / 10;
  const avgAssists = Math.round((10 * heroStat.assists) / heroStat.matches_played) / 10;
  const avgKd = Math.round((10 * (heroStat.kills + heroStat.assists)) / heroStat.deaths) / 10;
  const lastPlayed = formatRelativeTime(heroStat.last_played);
  const timePlayed = formatTimePlayed(heroStat.time_played);

  return (
    <View style={themed($heroStats)}>
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
        <HeroStatItemBox label="Games" value={heroStat.matches_played} />
        <HeroStatItemBox label="WR" value={`${winrate}%`} valueColor={scaleColor(winrate, 30, 70)} />
        <HeroStatItemBox
          label="KDA"
          value={`${avgKills.toFixed(1)}/${avgDeaths.toFixed(1)}/${avgAssists.toFixed(1)}`}
          valueColor={scaleColor(avgKd, 0.5, 4)}
        />
        <HeroStatItemBox
          label="Accuracy (Head)"
          value={`${Math.round(100 * heroStat.accuracy)}% (${Math.round(100 * heroStat.crit_shot_rate)}%)`}
          valueColor={scaleColor(heroStat.accuracy, 0.45, 0.7)}
        />
      </View>
      <View style={themed($bottomRow)}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}
          onPress={() =>
            navigateAny.navigate("MainHeroes", { screen: "Details", params: { heroId: heroStat.hero_id } })
          }
        >
          <Text size="xs" style={{ color: theme.colors.tint }}>
            View details
          </Text>
          <FontAwesome6 name="chevron-right" solid color={theme.colors.tint} size={14} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const HeroStatItemBox = (item: { label: string; value: string | number; valueColor?: string }) => {
  const { themed } = useAppTheme();
  return (
    <View style={themed($heroStatsContentStat)}>
      <Text numberOfLines={1} size="xxs" style={themed($heroStatsContentStatLabel)}>
        {item.label}
      </Text>
      <Text
        numberOfLines={1}
        style={[themed($heroStatsContentStatValue), item.valueColor && { color: item.valueColor }]}
        size="xs"
      >
        {item.value}
      </Text>
    </View>
  );
};

const $heroStats: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.sm,
  gap: spacing.sm,
  marginVertical: spacing.xxs,
  elevation: 1,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
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
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: spacing.sm,
});

const $bottomRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: spacing.sm,
  marginTop: spacing.xxs,
});

const $heroStatsContentStat: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xxs,
});

const $heroStatsContentStatLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});

const $heroStatsContentStatValue: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.semiBold,
});

const $heroNameText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
});
