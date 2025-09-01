import { FontAwesome6 } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import type { PlayerMatchHistoryEntry } from "deadlock-api-client";
import { Link, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, type TextStyle, View, type ViewStyle } from "react-native";
import { usePlayerSelected } from "src/app/_layout";
import { HeroImage } from "src/components/heroes/HeroImage";
import { HeroName } from "src/components/heroes/HeroName";
import { MatchList } from "src/components/matches/MatchList";
import { StatCard } from "src/components/profile/StatCard";
import { SteamImage } from "src/components/profile/SteamImage";
import { SteamName } from "src/components/profile/SteamName";
import { Screen } from "src/components/ui/Screen";
import { Text } from "src/components/ui/Text";
import { useAssetsHeroes } from "src/hooks/useAssetsHeroes";
import { useEnemyStats } from "src/hooks/useEnemyStats";
import { useMatchHistory } from "src/hooks/useMatchHistory";
import { useMateStats } from "src/hooks/useMateStats";
import { useSteamProfile } from "src/hooks/useSteamProfile";
import { translate } from "src/i18n/translate";
import { api } from "src/services/api";
import { useAppTheme } from "src/theme/context";
import { $styles } from "src/theme/styles";
import type { ThemedStyle } from "src/theme/types";
import { calculateKDA, calculateWinRate, filterLast7Days, getHeroStats, isMatchWon } from "src/utils/matchHistoryStats";
import { scaleColor } from "src/utils/scaleColor";
import { getSteamId, hasSteamId } from "src/utils/steamAuth";

export default function DashboardScreen() {
  const router = useRouter();
  const { themed, theme } = useAppTheme();

  const [player, setPlayer] = usePlayerSelected();

  const steamId = getSteamId();
  const { data: userProfile } = useSteamProfile({ accountId: steamId ?? 0 });

  useEffect(() => {
    if (!player && userProfile) setPlayer(userProfile ?? null);
  }, [userProfile, setPlayer, player]);

  const { data: matchHistory, isLoading, error } = useMatchHistory({ accountId: player?.account_id ?? 0 });

  const queryClient = useQueryClient();
  const onRefreshing = useCallback(async () => await queryClient.refetchQueries({ type: "active" }), [queryClient]);

  return (
    <Screen preset="scroll" contentContainerStyle={$styles.containerWithHeader} onRefreshing={onRefreshing}>
      {player?.account_id && matchHistory && matchHistory.length > 0 ? (
        <>
          <StatDisplays accountId={player?.account_id} matchHistory={matchHistory} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: theme.spacing.md,
            }}
          >
            <Text preset="subheading" tx="dashboardScreen:latestMatches" />
            <Link href="/(tabs)/matches">
              <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}>
                <Text
                  size="xxs"
                  style={[themed($viewAllText), { color: theme.colors.tint }]}
                  tx="dashboardScreen:viewAllMatches"
                />
                <FontAwesome6 name="chevron-right" solid color={theme.colors.tint} size={16} />
              </View>
            </Link>
          </View>
          <View style={themed($matchesContainer)}>
            <MatchList
              matches={matchHistory.slice(0, 5)}
              onPress={(matchId) => router.navigate(`/(tabs)/matches/${matchId}`)}
            />
          </View>
        </>
      ) : (
        <View>
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
}

export const StatDisplays = ({
  accountId,
  matchHistory,
}: {
  accountId: number;
  matchHistory: PlayerMatchHistoryEntry[];
}) => {
  const [_, setPlayer] = usePlayerSelected();

  const { themed, theme } = useAppTheme();

  const now = Math.floor(Date.now() / 1000);
  const nextFullHour = Math.ceil(now / 3600) * 3600;
  const minUnixTimestamp = nextFullHour - 30 * 24 * 60 * 60;
  const { data: mateStats, isLoading: mateLoading } = useMateStats({
    accountId: accountId ?? 0,
    sameParty: true,
    minMatchesPlayed: 10,
    minUnixTimestamp,
  });
  const { data: enemyStats, isLoading: enemyLoading } = useEnemyStats({
    accountId: accountId ?? 0,
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
    api.players_api.steam({ accountId }).then((response) => {
      if (response.status === 200) {
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
      <Link href={`/(tabs)/heroes/${mostPlayedHero.heroId}`} asChild>
        <StatCard
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
      </Link>
      <Link href={`/(tabs)/heroes/${highestWinRateHero.heroId}`} asChild>
        <StatCard
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
      </Link>
    </View>
  );
};

const $matchesContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
});

const $viewAllText: ThemedStyle<TextStyle> = () => ({
  fontWeight: "bold",
});

const $statDisplaysContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: spacing.sm,
});
