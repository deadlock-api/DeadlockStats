import { LinearGradient } from "expo-linear-gradient";
import type { FC } from "react";
import { ActivityIndicator, type TextStyle, TouchableOpacity, View, type ViewStyle } from "react-native";
import { HeroImage } from "@/components/heroes/HeroImage";
import { TeamDisplay } from "@/components/matches/TeamDisplay";
import { SteamName } from "@/components/profile/SteamName";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useAssetsMap } from "@/hooks/useAssetsMap";
import { useMatchMetadata } from "@/hooks/useMatchMetadata";
import { translate } from "@/i18n/translate";
import type { MatchesStackScreenProps } from "@/navigators/MatchesNavigator";
import { LobbyTeam } from "@/services/api/types/match_metadata";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { formatMatchDuration, formatRelativeTime, parseMatchMode } from "@/utils/matchHistoryStats";

const PARTY_COLORS = ["#FBDCA0", "#BDCBFF", "#FFA500", "#00BFFF", "#FFC0CB", "#00FF7F"];

export const MatchesDetailsScreen: FC<MatchesStackScreenProps<"Details">> = (props) => {
  const { themed, theme } = useAppTheme();

  const matchId = props.route.params.matchId;
  if (!matchId) {
    props.navigation.navigate({ name: "List", params: {} });
  }

  const { data: matchData, isLoading, error } = useMatchMetadata(matchId);
  const { data: mapData } = useAssetsMap();

  if (isLoading) {
    return (
      <Screen preset="scroll" contentContainerStyle={$styles.container}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={theme.colors.tint} />
          <Text preset="subheading" style={{ marginTop: theme.spacing.md }} tx="matchDetailsScreen:loadingMessage" />
        </View>
      </Screen>
    );
  }

  if (error || !matchData || !matchData.players) {
    return (
      <Screen preset="scroll" contentContainerStyle={$styles.container}>
        <View style={themed($errorContainer)}>
          <Text preset="heading" style={{ color: theme.colors.error }} tx="matchDetailsScreen:errorTitle" />
          <Text style={{ marginTop: theme.spacing.sm, textAlign: "center" }} tx="matchDetailsScreen:errorMessage" />
        </View>
      </Screen>
    );
  }

  // Separate players by team
  const team0Players = matchData.players
    .filter((player) => player.team === LobbyTeam.Team0)
    .sort((a, b) => (a.assigned_lane ?? 0) - (b.assigned_lane ?? 0));
  const team1Players = matchData.players
    .filter((player) => player.team === LobbyTeam.Team1)
    .sort((a, b) => (a.assigned_lane ?? 0) - (b.assigned_lane ?? 0));

  const team0Stats = team0Players.reduce(
    (acc, player) => ({
      kills: acc.kills + (player.kills ?? 0),
      deaths: acc.deaths + (player.deaths ?? 0),
      assists: acc.assists + (player.assists ?? 0),
      netWorth: acc.netWorth + (player.net_worth ?? 0),
      playerDamage: acc.playerDamage + (player.stats[player.stats.length - 1]?.player_damage ?? 0),
    }),
    { kills: 0, deaths: 0, assists: 0, netWorth: 0, playerDamage: 0 },
  );

  const team1Stats = team1Players.reduce(
    (acc, player) => ({
      kills: acc.kills + (player.kills ?? 0),
      deaths: acc.deaths + (player.deaths ?? 0),
      assists: acc.assists + (player.assists ?? 0),
      netWorth: acc.netWorth + (player.net_worth ?? 0),
      playerDamage: acc.playerDamage + (player.stats[player.stats.length - 1]?.player_damage ?? 0),
    }),
    { kills: 0, deaths: 0, assists: 0, netWorth: 0, playerDamage: 0 },
  );

  const parties = matchData.players.reduce((acc, player) => {
    if (player.party) {
      const key = [player.team ?? LobbyTeam.Team0, player.party] as [LobbyTeam, number];
      if (!acc.has(key)) acc.set(key, []);
      acc.get(key)?.push(player.account_id ?? 0);
    }
    return acc;
  }, new Map<[LobbyTeam, number], number[]>());

  const getPartyColor = (accountId: number) => {
    const party = [...parties.entries()].find(([, players]) => players.includes(accountId))?.[0];
    if (!party) return "transparent";
    return PARTY_COLORS[(party[1] % PARTY_COLORS.length) + party[0] * 3];
  };

  const getTeamFadeColor = (accountId: number) => {
    const team = matchData.players.find((player) => player.account_id === accountId)?.team;
    if (team === LobbyTeam.Team0) return theme.isDark ? "rgba(147,118,0, 0.5)" : "rgba(251,220,160, 0.8)";
    if (team === LobbyTeam.Team1) return theme.isDark ? "rgba(65,86,160, 0.5)" : "rgba(189,203,255, 0.8)";
    return "transparent";
  };

  const getLaneColor = (accountId: number) => {
    const lanes = [1, 4, 6];
    const lane = matchData.players.find((player) => player.account_id === accountId)?.assigned_lane;
    const laneIdx = lanes.indexOf(lane ?? 0);
    return mapData?.zipline_paths[laneIdx]?.color ?? "transparent";
  };

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$styles.container}>
      <View style={themed($container)}>
        <View>
          <Text preset="subheading" style={{ marginBottom: theme.spacing.md, textAlign: "center" }}>
            {translate("matchDetailsScreen:title")} {matchId}
          </Text>
          <View style={themed($headerContainer)}>
            <View style={{ alignItems: "flex-start" }}>
              <Text>{parseMatchMode(matchData.match_mode)}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text>{formatMatchDuration(matchData.duration_s ?? 0)}</Text>
              <Text>{formatRelativeTime(matchData.start_time ?? 0)}</Text>
            </View>
          </View>
          <View style={themed($teamsContainer)}>
            <TeamDisplay
              teamName="AMBER"
              badge={matchData.average_badge_team0}
              isWinner={matchData.winning_team === LobbyTeam.Team0}
              stats={team0Stats}
            />
            <TeamDisplay
              teamName="SAPPHIRE"
              badge={matchData.average_badge_team1}
              isWinner={matchData.winning_team === LobbyTeam.Team1}
              stats={team1Stats}
            />
          </View>
        </View>
        <View style={themed($playersContainer)}>
          <View style={themed($playersStatsContainer)}>
            <Text
              numberOfLines={1}
              style={[themed($playerHeader)]}
              size={"md"}
              tx="matchDetailsScreen:playerNameLabel"
            />
            {[...team0Players, ...team1Players].map((player) => (
              <TouchableOpacity
                key={player.account_id}
                onPress={() => {
                  player.account_id &&
                    props.navigation.navigate("PlayerDetails", {
                      matchId,
                      accountId: player.account_id,
                    });
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderLeftWidth: 4,
                    borderRadius: theme.spacing.xxs,
                    paddingLeft: theme.spacing.xxs,
                    borderLeftColor: getPartyColor(player.account_id ?? 0),
                    gap: theme.spacing.xxxs,
                  }}
                >
                  <LinearGradient
                    colors={["transparent", getTeamFadeColor(player.account_id ?? 0)]}
                    style={{ position: "absolute", left: 0, right: 0, top: 0, height: "100%", width: "80%" }}
                    end={{ x: 0.1, y: 0 }}
                  />
                  <HeroImage heroId={player.hero_id ?? 1} size={20} />
                  <View
                    style={{
                      marginLeft: theme.spacing.xs,
                      marginRight: theme.spacing.xxs,
                      padding: theme.spacing.xxs,
                      backgroundColor: getLaneColor(player.account_id ?? 0),
                    }}
                  ></View>
                  <Text numberOfLines={1} style={[themed($playerStat), themed($playerName)]} size={"md"}>
                    {player.account_id && <SteamName accountId={player.account_id} />}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={themed($playersStatsContainer)}>
            <Text
              numberOfLines={1}
              style={[themed($playerHeader)]}
              size={"md"}
              tx="matchDetailsScreen:playerKdaLabel"
            />
            {[...team0Players, ...team1Players].map((player) => (
              <Text numberOfLines={1} key={player.account_id} style={[themed($playerStat)]} size={"md"}>
                {player.kills}/{player.deaths}/{player.assists}
              </Text>
            ))}
          </View>
          <View style={themed($playersStatsContainer)}>
            <Text
              numberOfLines={1}
              style={[themed($playerHeader)]}
              size={"md"}
              tx="matchDetailsScreen:playerSoulsLabelShort"
            />
            {[...team0Players, ...team1Players].map((player) => (
              <Text numberOfLines={1} key={player.account_id} style={[themed($playerStat)]} size={"md"}>
                {((player.net_worth ?? 0) / 1000).toFixed(0)}k
              </Text>
            ))}
          </View>
          <View style={themed($playersStatsContainer)}>
            <Text
              numberOfLines={1}
              style={[themed($playerHeader)]}
              size={"md"}
              tx="matchDetailsScreen:playerDamageLabelShort"
            />
            {[...team0Players, ...team1Players].map((player) => (
              <Text numberOfLines={1} key={player.account_id} style={[themed($playerStat)]} size={"md"}>
                {((player.stats[player.stats.length - 1]?.player_damage ?? 0) / 1000).toFixed(0)}k
              </Text>
            ))}
          </View>
        </View>
      </View>
    </Screen>
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

const $container: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.sm,
  gap: spacing.md,
  width: "100%",
});

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
  paddingBottom: spacing.sm,
});

const $teamsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  width: "100%",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: spacing.md,
});

const $playersContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
  justifyContent: "space-between",
});

const $playersStatsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "column",
  gap: spacing.xs,
});

const $playerHeader: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.semiBold,
});

const $playerStat: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  maxWidth: 130,
});

const $playerName: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
});
