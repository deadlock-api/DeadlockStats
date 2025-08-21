import { useLocalSearchParams, useRouter } from "expo-router";
import type { FC } from "react";
import { ActivityIndicator, View, type ViewStyle } from "react-native";
import { usePlayerSelected } from "../../app/_layout";
import { PlayerStats } from "../../components/matches/PlayerStats";
import { Card } from "../../components/ui/Card";
import { Screen } from "../../components/ui/Screen";
import { Text } from "../../components/ui/Text";
import { useMatchMetadata } from "../../hooks/useMatchMetadata";
import { api } from "../../services/api";
import { useAppTheme } from "../../theme/context";
import { $styles } from "../../theme/styles";
import type { ThemedStyle } from "../../theme/types";

export const MatchesPlayerDetailsScreen: FC = () => {
  const router = useRouter();
  const { matchId, accountId } = useLocalSearchParams<{ matchId: string; accountId: string }>();
  const { themed, theme } = useAppTheme();

  const [_, setPlayer] = usePlayerSelected();
  if (!matchId || !accountId) {
    router.push("/(tabs)/matches");
    return null;
  }

  const matchIdNumber = Number(matchId);
  const playerNumber = Number(accountId);

  const { data: matchData, isLoading, error } = useMatchMetadata(matchIdNumber);

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

  const highlightedPlayer = matchData?.players.find((p) => p.account_id === playerNumber);

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
      if (response.ok && response.data) {
        setPlayer(response.data);
        router.push("/(tabs)");
      } else {
        throw new Error(`Error fetching steam profile: ${JSON.stringify(response)}`);
      }
    });
  };

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$styles.container}>
      <Card style={themed($container)}>
        <PlayerStats player={highlightedPlayer} updatePlayer={updatePlayer} />
      </Card>
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
