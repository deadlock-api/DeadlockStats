import { FontAwesome6 } from "@expo/vector-icons";
import { type FC, useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View, type ViewStyle } from "react-native";
import { HeroImage } from "@/components/heroes/HeroImage";
import { HeroName } from "@/components/heroes/HeroName";
import { StatCard } from "@/components/profile/StatCard";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useAssetsHeroes } from "@/hooks/useAssetsHeroes";
import { useMatchHistory } from "@/hooks/useMatchHistory";
import { useSteamProfile } from "@/hooks/useSteamProfile";
import type { DashboardStackScreenProps } from "@/navigators/DashboardNavigator";
import type { MatchHistory } from "@/services/api/types/match_history";
import type { SteamProfile } from "@/services/api/types/steam_profile";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { calculateKDA, calculateWinRate, filterLast7Days, getHeroStats, isMatchWon } from "@/utils/matchHistoryStats";
import { getSteamId } from "@/utils/steamAuth";

export const DashboardScreen: FC<DashboardStackScreenProps<"Dashboard">> = (props) => {
  const { themed, theme } = useAppTheme();

  const steamId = getSteamId();
  const { data: userProfile } = useSteamProfile(steamId);

  const initialPlayer = props.route.params?.selectedPlayer?.account_id
    ? props.route.params.selectedPlayer
    : userProfile;

  const [player, setPlayer] = useState<SteamProfile | null>(initialPlayer ?? null);

  useEffect(() => {
    if (!player) setPlayer(userProfile ?? null);
  }, [player, userProfile]);

  const { data: matchHistory, isLoading, error } = useMatchHistory(player?.account_id ?? null);

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$styles.container}>
      <View style={themed($header)}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
          <Text preset="subheading">
            {player && player.account_id !== steamId
              ? (player?.personaname ?? player?.realname ?? player?.account_id)
              : (userProfile?.personaname ?? userProfile?.realname ?? userProfile?.account_id)}
          </Text>
          {player && player.account_id !== steamId && (
            <TouchableOpacity onPress={() => setPlayer(userProfile ?? null)}>
              <FontAwesome6 name="xmark" solid color={theme.colors.error} size={20} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={[themed($searchButton)]} onPress={() => props.navigation.navigate("PlayerSearch")}>
          <FontAwesome6 name="magnifying-glass" solid color={theme.colors.text} size={24} />
        </TouchableOpacity>
      </View>
      {matchHistory && matchHistory.length > 0 ? (
        <StatDisplays matchHistory={matchHistory} />
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

  const scaleColor = (value: number, min: number, max: number) => {
    const inBoundsValue = Math.min(Math.max(value, min), max);
    const normalizedValue = (inBoundsValue - min) / (max - min);
    const red = Math.round(255 * (1 - normalizedValue));
    const green = Math.round(255 * normalizedValue);
    return `rgb(${red}, ${green}, 0)`;
  };

  return (
    <View style={themed($statDisplaysContainer)}>
      <StatCard
        title="Win Rate (7 Days)"
        value={`${winRate}%`}
        subtitle={`${wins}W ${losses}L`}
        valueColor={scaleColor(winRate, 30, 70)}
      />
      <StatCard
        title="Avg KDA (7 Days)"
        value={kda.ratio}
        subtitle={`${kda.kills}/${kda.deaths}/${kda.assists}`}
        valueColor={scaleColor(kda.ratio, 0.5, 3)}
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
            <HeroImage hero_id={mostPlayedHero.heroId} size={30} />
            <Text numberOfLines={1} style={{ color: theme.colors.text }}>
              <HeroName hero_id={mostPlayedHero.heroId} />
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
            <HeroImage hero_id={highestWinRateHero.heroId} size={30} />
            <Text numberOfLines={1} style={{ color: theme.colors.text }}>
              <HeroName hero_id={highestWinRateHero.heroId} />
            </Text>
          </View>
        }
        subtitle={`${highestWinRateHero.winRate}% WR | ${highestWinRateHero.playCount} M`}
        valueColor={theme.colors.text}
      />
    </View>
  );
};

const $noDataContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
});

const $statDisplaysContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  flexDirection: "row",
  justifyContent: "space-evenly",
  flexWrap: "wrap",
  gap: spacing.md,
});

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.md,
});

const $searchButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  backgroundColor: colors.palette.neutral100,
  borderColor: colors.border,
});
