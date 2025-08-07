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
import { useMatchHistory } from "@/hooks/useMatchHistory";
import { useMateStats } from "@/hooks/useMateStats";
import { translate } from "@/i18n/translate";
import type { DashboardStackScreenProps } from "@/navigators/DashboardNavigator";
import type { MatchHistory } from "@/services/api/types/match_history";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { calculateKDA, calculateWinRate, filterLast7Days, getHeroStats, isMatchWon } from "@/utils/matchHistoryStats";
import { scaleColor } from "@/utils/scaleColor";
import { hasSteamId } from "@/utils/steamAuth";

export const DashboardScreen: FC<DashboardStackScreenProps<"Dashboard">> = (props) => {
  const { themed, theme } = useAppTheme();

  const [player, _] = usePlayerSelected();

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
              onPress={() => props.navigation.navigate("MainMatches", { screen: "List" })}
            >
              <Text style={[themed($viewAllText), { color: theme.colors.text }]} tx="dashboardScreen:viewAllMatches" />
              <FontAwesome6 name="chevron-right" solid color={theme.colors.text} size={16} />
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
            <Text tx="dashboardScreen:loadingMatchHistory" />
          ) : error ? (
            <Text tx="dashboardScreen:failedToLoadMatchHistory" />
          ) : !hasSteamId() ? (
            <Text tx="dashboardScreen:noSteamAccountLinked" />
          ) : (
            <Text tx="dashboardScreen:noMatchesFound" />
          )}
        </View>
      )}
    </Screen>
  );
};

export const StatDisplays = ({ accountId, matchHistory }: { accountId: number; matchHistory: MatchHistory[] }) => {
  const { themed, theme } = useAppTheme();
  const navigation = useNavigation();

  const { data: mateStats } = useMateStats(accountId ?? null, { sameParty: true, minMatchesPlayed: 10 });

  const mostPlayedMate = mateStats?.sort((a, b) => b.matches_played - a.matches_played)[0];
  const bestMate = mateStats?.sort((a, b) => b.wins / b.matches_played - a.wins / a.matches_played)[0];

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
        <Text style={[themed($statValue), { color: winRateColor }]}>{winrateValue}</Text>
        {icon && (
          <FontAwesome6
            style={{ color: winRateColorHard, marginLeft: theme.spacing.xxs }}
            name={icon}
            solid
            size={16}
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
      {mostPlayedMate && (
        <StatCard
          title={translate("dashboardScreen:mainMateOverall")}
          value={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.xs,
                marginBottom: theme.spacing.xxs,
              }}
            >
              <SteamImage accountId={mostPlayedMate?.mate_id ?? 0} size={30} />
              <Text numberOfLines={1} style={{ color: theme.colors.text, maxWidth: 100 }}>
                <SteamName accountId={mostPlayedMate?.mate_id ?? 0} />
              </Text>
            </View>
          }
          subtitle={`${((mostPlayedMate?.wins ?? 0) / (mostPlayedMate?.matches_played ?? 1)).toFixed(2) * 100}% WR | ${mostPlayedMate.matches_played} M`}
          valueColor={theme.colors.text}
        />
      )}
      {bestMate && (
        <StatCard
          title={translate("dashboardScreen:bestMateOverall")}
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
          subtitle={`${((bestMate?.wins ?? 0) / (bestMate?.matches_played ?? 1)).toFixed(2) * 100}% WR | ${bestMate.matches_played} M`}
          valueColor={theme.colors.text}
        />
      )}
      <TouchableOpacity onPress={() => navigation.navigate("MainHeroes")}>
        <StatCard
          title={
            <>
              <Text tx="dashboardScreen:mainHeroOverall" style={{ fontSize: 14, color: theme.colors.textDim }} />
              <FontAwesome6 name="chevron-right" solid color={theme.colors.textDim} size={12} />
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
      <TouchableOpacity onPress={() => navigation.navigate("MainHeroes")}>
        <StatCard
          title={
            <>
              <Text tx="dashboardScreen:bestHeroOverall" style={{ fontSize: 14, color: theme.colors.textDim }} />
              <FontAwesome6 name="chevron-right" solid color={theme.colors.textDim} size={12} />
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
  fontSize: 12,
  fontWeight: "bold",
});

const $noDataContainer: ThemedStyle<TextStyle> = () => ({
  fontSize: 16,
  fontFamily: "Inter-SemiBold",
});

const $statDisplaysContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: spacing.sm,
});
