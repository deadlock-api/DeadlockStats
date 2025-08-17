import { FontAwesome6 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { FC } from "react";
import { ActivityIndicator, FlatList, type TextStyle, TouchableOpacity, View, type ViewStyle } from "react-native";
import { usePlayerSelected, useTimeRangeSelected } from "@/app";
import { HeroImage } from "@/components/heroes/HeroImage";
import { HeroName } from "@/components/heroes/HeroName";
import { StatItem } from "@/components/matches/StatItem";
import { TimeRangeSelect } from "@/components/select/TimeRangeSelect";
import { Card } from "@/components/ui/Card";
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
        <FlatList
          data={heroStats}
          renderItem={({ item }) => (
            <HeroStatItem
              heroStat={item}
              onPress={() => {
                navigator.navigate("MainHeroes", { screen: "Details", params: { heroId: item.hero_id } });
              }}
            />
          )}
          ListEmptyComponent={() => (
            <View style={{ alignItems: "center", justifyContent: "center", padding: 16 }}>
              <Text tx="heroesStatsScreen:noHeroStatsFound" />
            </View>
          )}
          keyExtractor={(item) => item.hero_id.toString()}
          maxToRenderPerBatch={20}
          initialNumToRender={10}
          windowSize={10}
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
};

const HeroStatItem = ({ heroStat, onPress }: { heroStat: HeroStats; onPress?: () => void }) => {
  const { themed, theme } = useAppTheme();
  const navigation = useNavigation();

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
      <View style={themed($bottomRow)}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}
          onPress={() => navigation.navigate("MainHeroes", { screen: "Details", params: { heroId: heroStat.hero_id } })}
        >
          <Text size="xs" style={{ color: theme.colors.tint }}>
            View details
          </Text>
          <FontAwesome6 name="chevron-right" solid color={theme.colors.tint} size={14} />
        </TouchableOpacity>
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

const $bottomRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: spacing.sm,
  marginTop: spacing.xxs,
});

const $heroNameText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
});
