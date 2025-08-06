import type { FC } from "react";
import { ActivityIndicator, View, type ViewStyle } from "react-native";
import { usePlayerSelected } from "@/app";
import { PlayerStats } from "@/components/matches/PlayerStats";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useMatchMetadata } from "@/hooks/useMatchMetadata";
import type { MatchesStackScreenProps } from "@/navigators/MatchesNavigator";
import { api } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import { spacing } from "@/theme/spacing";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";

export const MatchesPlayerDetailsScreen: FC<MatchesStackScreenProps<"PlayerDetails">> = (props) => {
  const { themed, theme } = useAppTheme();

  const [_, setPlayer] = usePlayerSelected();
  const matchId = props.route.params.matchId;
  const player = props.route.params.accountId;
  if (!matchId || !player) {
    props.navigation.navigate({ screen: "List", params: {} });
  }

  const { data: matchData, isLoading, error } = useMatchMetadata(matchId);

  if (isLoading) {
    return (
      <Screen preset="fixed" contentContainerStyle={$styles.container}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={theme.colors.tint} />
          <Text preset="subheading" style={{ marginTop: theme.spacing.md }} tx="matchDetailsScreen:loadingMessage" />
        </View>
      </Screen>
    );
  }

  const highlightedPlayer = matchData?.players.find((p) => p.account_id === player);

  if (error || !matchData || !matchData.players || !highlightedPlayer) {
    return (
      <Screen preset="fixed" contentContainerStyle={$styles.container}>
        <View style={themed($errorContainer)}>
          <Text preset="heading" style={{ color: theme.colors.error }} tx="matchDetailsScreen:errorTitle" />
          <Text style={{ marginTop: theme.spacing.sm, textAlign: "center" }} tx="matchDetailsScreen:errorMessage" />
        </View>
      </Screen>
    );
  }

  const updatePlayer = (accountId: number) => {
    api.getSteamProfile(accountId).then((response) => {
      if (response.ok) {
        if (response.data) {
          setPlayer(response.data);
          props.navigation.navigate("MainDashboard");
        }
      } else {
        throw new Error(`Error fetching steam profile: ${JSON.stringify(response)}`);
      }
    });
  };

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$styles.container}>
      <View style={themed($container)}>
        <PlayerStats player={highlightedPlayer} updatePlayer={updatePlayer} />
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
  marginTop: spacing.xl + spacing.xl,
  width: "100%",
});
