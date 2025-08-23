import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, View, type ViewStyle } from "react-native";
import { usePlayerSelected } from "src/app/_layout";
import { PlayerStats } from "src/components/matches/PlayerStats";
import { Card } from "src/components/ui/Card";
import { Screen } from "src/components/ui/Screen";
import { Text } from "src/components/ui/Text";
import { useMatchMetadata } from "src/hooks/useMatchMetadata";
import { api } from "src/services/api";
import { useAppTheme } from "src/theme/context";
import { $styles } from "src/theme/styles";
import type { ThemedStyle } from "src/theme/types";

export default function MatchPlayerDetails() {
  const router = useRouter();
  const { matchId, accountId } = useLocalSearchParams<{ matchId: string; accountId: string }>();
  const { themed, theme } = useAppTheme();

  const [_, setPlayer] = usePlayerSelected();

  const matchIdNumber = Number(matchId);
  const playerNumber = Number(accountId);

  const { data: matchData, isLoading, error } = useMatchMetadata(matchIdNumber);

  if (!matchId || !accountId) {
    router.replace("/(tabs)/matches");
    return null;
  }

  if (isLoading) {
    return (
      <Screen preset="fixed" contentContainerStyle={$styles.containerWithHeader}>
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
      <Screen preset="fixed" contentContainerStyle={$styles.containerWithHeader}>
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
        router.navigate("/(tabs)/dashboard");
      } else {
        throw new Error(`Error fetching steam profile: ${JSON.stringify(response)}`);
      }
    });
  };

  return (
    <Screen preset="scroll" contentContainerStyle={$styles.containerWithHeader}>
      <Card style={themed($container)}>
        <PlayerStats player={highlightedPlayer} updatePlayer={updatePlayer} />
      </Card>
    </Screen>
  );
}

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
