import { FontAwesome6 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { type FC, useCallback } from "react";
import { ActivityIndicator, type TextStyle, TouchableOpacity, View, type ViewStyle } from "react-native";
import { usePlayerSelected } from "@/app";
import { HeroImage } from "@/components/heroes/HeroImage";
import { HeroName } from "@/components/heroes/HeroName";
import { MatchList } from "@/components/matches/MatchList";
import { AccountSelector } from "@/components/profile/AccountSelector";
import { StatCard } from "@/components/profile/StatCard";
import { SteamImage } from "@/components/profile/SteamImage";
import { SteamName } from "@/components/profile/SteamName";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useAssetsHeroes } from "@/hooks/useAssetsHeroes";
import { useEnemyStats } from "@/hooks/useEnemyStats";
import { useMatchHistory } from "@/hooks/useMatchHistory";
import { useMateStats } from "@/hooks/useMateStats";
import { translate } from "@/i18n/translate";
import type { DashboardStackScreenProps } from "@/navigators/DashboardNavigator";
import { api } from "@/services/api";
import type { MatchHistory } from "@/services/api/types/match_history";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { calculateKDA, calculateWinRate, filterLast7Days, getHeroStats, isMatchWon } from "@/utils/matchHistoryStats";
import { scaleColor } from "@/utils/scaleColor";
import { hasSteamId } from "@/utils/steamAuth";

export const DashboardScreen: FC<DashboardStackScreenProps<"Dashboard">> = (props) => {
  const { themed, theme } = useAppTheme();

  const [player] = usePlayerSelected();

  const { data: matchHistory, isLoading, error } = useMatchHistory(player?.account_id ?? null);

  const queryClient = useQueryClient();
  const onRefreshing = useCallback(async () => await queryClient.refetchQueries({ type: "active" }), [queryClient]);

  return (
    <Screen preset="scroll" contentContainerStyle={$styles.container} onRefreshing={onRefreshing}>
      <AccountSelector />
      {matchHistory && matchHistory.length > 0 ? (
        <>
          <StatDisplays accountId={player?.account_id ?? 0} matchHistory={matchHistory} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: theme.spacing.md,
            }}
          >
            <Text preset="subheading" tx="dashboardScreen:latestMatches" />
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}
              onPress={() => (props.navigation as any).navigate("MainMatches", { screen: "List" })}
            >
              <Text
                size="xxs"
                style={[themed($viewAllText), { color: theme.colors.tint }]}
                tx="dashboardScreen:viewAllMatches"
              />
              <FontAwesome6 name="chevron-right" solid color={theme.colors.tint} size={16} />
            </TouchableOpacity>
          </View>
          <View style={themed($matchesContainer)}>
            <MatchList matches={matchHistory.slice(0, 5)} />
          </View>
        </>
      ) : (
        <View style={themed($noDataContainer)}>
          {isLoading ? (
            <Text tx="dashboardScreen:loadingMatchHistory" size="md" />
          ) : error ? (
            <Text tx="dashboardScreen:failedToLoadMatchHistory" size="md" />
          ) : !hasSteamId() ? (
            <Text tx="dashboardScreen:noSteamAccountLinked" size="md" />
          ) : (
            <Text tx="dashboardScreen:noMatchesFound" size="md" />
          )}
        </View>
      )}
    </Screen>
  );
};

export const StatDisplays = ({ accountId, matchHistory }: { accountId: number; matchHistory: MatchHistory[] }) => {
  const [_, setPlayer] = usePlayerSelected();

  const { themed, theme } = useAppTheme();
  const navigation = useNavigation();

  const now = Math.floor(Date.now() / 1000);
  const nextFullHour = Math.ceil(now / 3600) * 3600;
  const minUnixTimestamp = nextFullHour - 30 * 24 * 60 * 60;
  const { data: mateStats, isLoading: mateLoading } = useMateStats(accountId ?? null, {
    sameParty: true,
    minMatchesPlayed: 10,
    minUnixTimestamp,
  });
  const { data: enemyStats, isLoading: enemyLoading } = useEnemyStats(accountId ?? null, {
    minUnixTimestamp,
  });
  const uniqueMatchesPlayedMates = [...new Set(mateStats?.map((m) => m.matches_played))];
  const avgMatchesPlayedMates =
    uniqueMatchesPlayedMates.reduce((sum, val) => sum + val, 0) / uniqueMatchesPlayedMates.length;
  const bestMate = mateStats
    ?.filter((m) => m.matches_played >= avgMatchesPlayedMates)
    .sort((a, b) => b.wins / b.matches_played - a.wins / a.matches_played)[0];
  const uniqueMatchesPlayedEnemies = [...new Set(enemyStats?.map((m) => m.matches_played))];
  const avgMatchesPlayedEnemies =
    uniqueMatchesPlayedEnemies.reduce((acc, m) => acc + m, 0) / uniqueMatchesPlayedEnemies.length;
  const worstEnemy = enemyStats
    ?.filter((m) => m.matches_played >= avgMatchesPlayedEnemies)
    .sort((a, b) => a.wins / a.matches_played - b.wins / b.matches_played)[0];

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

  function updatePlayer(accountId: number) {
    api.getSteamProfile(accountId).then((response) => {
      if (response.ok) {
        if (response.data) {
          setPlayer(response.data);
        }
      } else {
        throw new Error(`Error fetching steam profile: ${JSON.stringify(response)}`);
      }
    });
  }

  if (mateLoading || enemyLoading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={themed($statDisplaysContainer)}>
      <StatCard
        title={translate("dashboardScreen:winRate7Days")}
        value={`${winRate}%`}
        valueChange={wins - losses}
        valueColor={wins + losses > 0 ? scaleColor(winRate, 30, 70) : theme.colors.text}
        subtitle={`${wins}W ${losses}L`}
      />
      <StatCard
        title={translate("dashboardScreen:avgKda7Days")}
        value={kda.ratio > 0 ? kda.ratio : "N/A"}
        subtitle={`${kda.kills}/${kda.deaths}/${kda.assists}`}
        valueColor={kda.ratio > 0 ? scaleColor(kda.ratio, 0.5, 4) : theme.colors.text}
      />
      {bestMate && (
        <StatCard
          onPress={() => updatePlayer(bestMate.mate_id)}
          title={translate("dashboardScreen:bestMate30d")}
          value={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.xs,
                marginBottom: theme.spacing.xxs,
                width: "100%",
              }}
            >
              <SteamImage accountId={bestMate?.mate_id ?? 0} size={30} />
              <Text
                numberOfLines={1}
                style={{ color: theme.colors.text, marginRight: theme.spacing.xl }}
                ellipsizeMode="tail"
              >
                <SteamName accountId={bestMate?.mate_id ?? 0} />
              </Text>
            </View>
          }
          subtitle={`${((100 * (bestMate?.wins ?? 0)) / (bestMate?.matches_played ?? 1)).toFixed(0)}% WR | ${bestMate.matches_played} M`}
          valueColor={theme.colors.text}
        />
      )}
      {worstEnemy && (
        <StatCard
          onPress={() => updatePlayer(worstEnemy.enemy_id)}
          title={translate("dashboardScreen:worstEnemy30d")}
          value={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.xs,
                marginBottom: theme.spacing.xxs,
              }}
            >
              <SteamImage accountId={worstEnemy?.enemy_id ?? 0} size={30} />
              <Text numberOfLines={1} style={{ color: theme.colors.text, maxWidth: 100 }}>
                <SteamName accountId={worstEnemy?.enemy_id ?? 0} />
              </Text>
            </View>
          }
          subtitle={`${((100 * (worstEnemy?.wins ?? 0)) / (worstEnemy?.matches_played ?? 1)).toFixed(0)}% WR | ${worstEnemy.matches_played} M`}
          valueColor={theme.colors.text}
        />
      )}
      <StatCard
        onPress={() =>
          (navigation as any).navigate("MainHeroes", { screen: "Details", params: { heroId: mostPlayedHero.heroId } })
        }
        title={translate("dashboardScreen:mainHeroOverall")}
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
        onPress={() =>
          (navigation as any).navigate("MainHeroes", {
            screen: "Details",
            params: { heroId: highestWinRateHero.heroId },
          })
        }
        title={translate("dashboardScreen:bestHeroOverall")}
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

const $matchesContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
});

const $viewAllText: ThemedStyle<TextStyle> = () => ({
  fontWeight: "bold",
});

const $noDataContainer: ThemedStyle<TextStyle> = () => ({
  fontFamily: "Inter-SemiBold",
});

const $statDisplaysContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: spacing.sm,
});
