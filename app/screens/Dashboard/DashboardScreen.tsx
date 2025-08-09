import { FontAwesome6 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { type FC } from "react";
import { ActivityIndicator, type TextStyle, TouchableOpacity, View, type ViewStyle } from "react-native";
import { usePlayerSelected } from "@/app";
import { HeroImage } from "@/components/heroes/HeroImage";
import { HeroName } from "@/components/heroes/HeroName";
import { MatchItem } from "@/components/matches/MatchItem";
import { AccountSelector } from "@/components/profile/AccountSelector";
import { $statValue, StatCard } from "@/components/profile/StatCard";
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

  const [player, setPlayer] = usePlayerSelected();

  const { data: matchHistory, isLoading, error } = useMatchHistory(player?.account_id ?? null);

  return (
    <Screen preset="scroll" contentContainerStyle={$styles.container}>
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
            <Text preset="subheading" tx="dashboardScreen:recentMatches" />
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
            {matchHistory.slice(0, 5).map((match) => (
              <MatchItem
                key={match.match_id}
                match={match}
                onPress={() =>
                  props.navigation.navigate("MainMatches", {
                    screen: "Details",
                    params: {
                      matchId: match.match_id,
                    },
                  })
                }
              />
            ))}
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
  const { data: mateStats } = useMateStats(accountId ?? null, {
    sameParty: true,
    minMatchesPlayed: 10,
    minUnixTimestamp,
  });
  const bestMate = mateStats?.sort((a, b) => b.wins / b.matches_played - a.wins / a.matches_played)[0];

  const { data: enemyStats } = useEnemyStats(accountId ?? null, {
    minMatchesPlayed: 3,
    minUnixTimestamp,
  });
  const worstEnemy = enemyStats?.sort((a, b) => a.wins / a.matches_played - b.wins / b.matches_played)[0];

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

  const winLossDiff = wins - losses;
  const winRateColor = scaleColor(winRate, 30, 70);
  const winRateColorHard = winRate >= 50 ? theme.colors.palette.success500 : theme.colors.palette.failure500;

  let winRateField = <Text>-</Text>;
  if (wins + losses > 0) {
    const winrateValue = `${winRate}%`;
    const icon = winLossDiff > 0 ? "caret-up" : winLossDiff < 0 ? "caret-down" : null;
    winRateField = (
      <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xxs }}>
        <Text style={[themed($statValue), { color: winRateColor }]} size="xl">
          {winrateValue}
        </Text>
        {icon && (
          <FontAwesome6
            style={{ color: winRateColorHard, marginLeft: theme.spacing.xxs }}
            name={icon}
            solid
            size={18}
          />
        )}
        {winLossDiff !== 0 && (
          <Text size="md" style={{ color: winRateColorHard }}>
            {Math.abs(winLossDiff)}
          </Text>
        )}
      </View>
    );
  }

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

  return (
    <View style={themed($statDisplaysContainer)}>
      <StatCard
        title={translate("dashboardScreen:winRate7Days")}
        value={winRateField}
        subtitle={`${wins}W ${losses}L`}
      />
      <StatCard
        title={translate("dashboardScreen:avgKda7Days")}
        value={kda.ratio > 0 ? kda.ratio : "-"}
        subtitle={`${kda.kills}/${kda.deaths}/${kda.assists}`}
        valueColor={scaleColor(kda.ratio, 0.5, 4)}
      />
      {bestMate && (
        <TouchableOpacity onPress={() => updatePlayer(bestMate.mate_id)}>
          <StatCard
            title={
              <>
                <Text tx="dashboardScreen:bestMate30d" size="xs" style={{ color: theme.colors.textDim }} />
                <FontAwesome6 name="chevron-right" solid color={theme.colors.tint} size={12} />
              </>
            }
            value={
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: theme.spacing.xs,
                  marginBottom: theme.spacing.xxs,
                }}
              >
                <SteamImage accountId={bestMate?.mate_id ?? 0} size={30} />
                <Text numberOfLines={1} style={{ color: theme.colors.text, maxWidth: 100 }}>
                  <SteamName accountId={bestMate?.mate_id ?? 0} />
                </Text>
              </View>
            }
            subtitle={`${((100 * (bestMate?.wins ?? 0)) / (bestMate?.matches_played ?? 1)).toFixed(0)}% WR | ${bestMate.matches_played} M`}
            valueColor={theme.colors.text}
          />
        </TouchableOpacity>
      )}
      {worstEnemy && (
        <TouchableOpacity onPress={() => updatePlayer(worstEnemy.enemy_id)}>
          <StatCard
            title={
              <>
                <Text tx="dashboardScreen:worstEnemy30d" size="xs" style={{ color: theme.colors.textDim }} />
                <FontAwesome6 name="chevron-right" solid color={theme.colors.tint} size={12} />
              </>
            }
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
        </TouchableOpacity>
      )}
      <TouchableOpacity
        // @ts-expect-error navigating into tab child stack
        onPress={() =>
          (navigation as any).navigate("MainHeroes", { screen: "Details", params: { heroId: mostPlayedHero.heroId } })
        }
      >
        <StatCard
          title={
            <>
              <Text tx="dashboardScreen:mainHeroOverall" size="xs" style={{ color: theme.colors.textDim }} />
              <FontAwesome6 name="chevron-right" solid color={theme.colors.tint} size={12} />
            </>
          }
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
      </TouchableOpacity>
      <TouchableOpacity
        // @ts-expect-error navigating into tab child stack
        onPress={() =>
          (navigation as any).navigate("MainHeroes", {
            screen: "Details",
            params: { heroId: highestWinRateHero.heroId },
          })
        }
      >
        <StatCard
          title={
            <>
              <Text tx="dashboardScreen:bestHeroOverall" size="xs" style={{ color: theme.colors.textDim }} />
              <FontAwesome6 name="chevron-right" solid color={theme.colors.tint} size={12} />
            </>
          }
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
      </TouchableOpacity>
    </View>
  );
};

const $matchesContainer: ThemedStyle<ViewStyle> = () => ({
  borderRadius: 16,
  overflow: "hidden",
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
