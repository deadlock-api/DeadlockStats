import { FontAwesome6 } from "@expo/vector-icons";
import type { FC } from "react";
import { ActivityIndicator, type TextStyle, TouchableOpacity, View, type ViewStyle } from "react-native";
import { usePlayerSelected } from "@/app";
import { HeroImage } from "@/components/heroes/HeroImage";
import { HeroName } from "@/components/heroes/HeroName";
import { MatchItem } from "@/components/matches/MatchItem";
import { AccountSelector } from "@/components/profile/AccountSelector";
import { StatCard } from "@/components/profile/StatCard";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useAssetsHeroes } from "@/hooks/useAssetsHeroes";
import { useMatchHistory } from "@/hooks/useMatchHistory";
import type { DashboardStackScreenProps } from "@/navigators/DashboardNavigator";
import type { MatchHistory } from "@/services/api/types/match_history";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { calculateKDA, calculateWinRate, filterLast7Days, getHeroStats, isMatchWon } from "@/utils/matchHistoryStats";
import { scaleColor } from "@/utils/scaleColor";

export const DashboardScreen: FC<DashboardStackScreenProps<"Dashboard">> = (props) => {
  const { themed, theme } = useAppTheme();

  const [player, _] = usePlayerSelected();

  const { data: matchHistory, isLoading, error } = useMatchHistory(player?.account_id ?? null);

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$styles.container}>
      <AccountSelector />
      {matchHistory && matchHistory.length > 0 ? (
        <>
          <StatDisplays matchHistory={matchHistory} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text preset="subheading" style={{ marginVertical: theme.spacing.md }}>
              Recent Matches
            </Text>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}
              onPress={() => props.navigation.navigate("MainMatches", { screen: "MatchesList" })}
            >
              <Text style={[themed($viewAllText), { color: theme.colors.text }]}>View All Matches</Text>
              <FontAwesome6 name="chevron-right" solid color={theme.colors.text} size={16} />
            </TouchableOpacity>
          </View>
          <View style={[themed($matchesContainer), { backgroundColor: theme.colors.palette.neutral100 }]}>
            {matchHistory.slice(0, 4).map((match, index) => (
              <MatchItem
                key={match.match_id}
                match={match}
                noBorder={index === 3}
                onPress={() =>
                  props.navigation.navigate("MainMatches", {
                    screen: "MatchDetails",
                    matchId: match.match_id,
                  })
                }
              />
            ))}
          </View>
        </>
      ) : (
        <View style={themed($noDataContainer)}>
          {isLoading ? (
            <Text text="Loading match history..." />
          ) : error ? (
            <Text text="Failed to load match history" />
          ) : (
            <Text text="No matches found" />
          )}
        </View>
      )}
    </Screen>
  );
};

export const StatDisplays = ({ matchHistory }: { matchHistory: MatchHistory[] }) => {
  const { themed, theme } = useAppTheme();

  const { data: assetsHeroes } = useAssetsHeroes();
  const heroIds = assetsHeroes?.map((h) => h.id) ?? [];

  const last7DaysMatches = filterLast7Days(matchHistory);

  const winRate = calculateWinRate(last7DaysMatches);
  const wins = last7DaysMatches.filter((match) => isMatchWon(match)).length;
  const losses = last7DaysMatches.filter((match) => !isMatchWon(match)).length;
  const kda = calculateKDA(last7DaysMatches);
  const heroStats = getHeroStats(matchHistory).filter((stats) => heroIds.includes(stats.heroId));

  if (!heroStats.length) return <ActivityIndicator />;

  const avgMatchesPerHero = Math.round(matchHistory.length / heroStats.length);
  const mostPlayedHero = heroStats.sort((a, b) => b.playCount - a.playCount)[0];
  const highestWinRateHero = heroStats
    .filter((stats) => stats.playCount >= avgMatchesPerHero)
    .sort((a, b) => b.winRate - a.winRate)[0];

  return (
    <View style={themed($statDisplaysContainer)}>
      <StatCard
        title="Win Rate (7 Days)"
        value={wins + losses > 0 ? `${winRate}%` : "-"}
        subtitle={`${wins}W ${losses}L`}
        valueColor={scaleColor(winRate, 30, 70)}
      />
      <StatCard
        title="Avg KDA (7 Days)"
        value={kda.ratio > 0 ? kda.ratio : "-"}
        subtitle={`${kda.kills}/${kda.deaths}/${kda.assists}`}
        valueColor={scaleColor(kda.ratio, 0.5, 4)}
      />
      <StatCard
        title="Main Hero (Overall)"
        value={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.xs,
              marginBottom: theme.spacing.xxs,
            }}
          >
            <HeroImage heroId={mostPlayedHero.heroId} size={30} />
            <Text numberOfLines={1} style={{ color: theme.colors.text }}>
              <HeroName heroId={mostPlayedHero.heroId} />
            </Text>
          </View>
        }
        subtitle={`${mostPlayedHero.winRate}% WR | ${mostPlayedHero.playCount} M`}
        valueColor={theme.colors.text}
      />
      <StatCard
        title="Best Hero (Overall)"
        value={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.xs,
              marginBottom: theme.spacing.xxs,
            }}
          >
            <HeroImage heroId={highestWinRateHero.heroId} size={30} />
            <Text numberOfLines={1} style={{ color: theme.colors.text }}>
              <HeroName heroId={highestWinRateHero.heroId} />
            </Text>
          </View>
        }
        subtitle={`${highestWinRateHero.winRate}% WR | ${highestWinRateHero.playCount} M`}
        valueColor={theme.colors.text}
      />
    </View>
  );
};

const $matchesContainer: ThemedStyle<ViewStyle> = () => ({
  // marginHorizontal: 20,
  borderRadius: 16,
  overflow: "hidden",
  elevation: 2,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
});

const $viewAllText: ThemedStyle<TextStyle> = () => ({
  fontSize: 12,
  fontWeight: "bold",
});

const $noDataContainer: ThemedStyle<TextStyle> = () => ({
  fontSize: 16,
  fontFamily: "Inter-SemiBold",
});

const $statDisplaysContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  flexDirection: "row",
  justifyContent: "space-evenly",
  flexWrap: "wrap",
  gap: spacing.md,
});
