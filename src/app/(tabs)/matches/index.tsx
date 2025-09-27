import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, View } from "react-native";
import { usePlayerSelected, useTimeRangeSelected } from "src/app/_layout";
import { MatchList } from "src/components/matches/MatchList";
import { TimeRangeSelect } from "src/components/select/TimeRangeSelect";
import { Screen } from "src/components/ui/Screen";
import { Text } from "src/components/ui/Text";
import { useMatchHistory } from "src/hooks/useMatchHistory";
import { $styles } from "src/theme/styles";

export default function MatchesList() {
  const router = useRouter();
  const { matchIds } = useLocalSearchParams<{ matchIds?: string }>();

  const [timeRange, _1] = useTimeRangeSelected();
  const [player, _2] = usePlayerSelected();

  const now = Math.floor(Date.now() / 1000);
  const nextFullHour = Math.ceil(now / 3600) * 3600;
  const minUnixTimestamp = timeRange.value ? nextFullHour - timeRange.value : 0;
  let { data: matchHistory, isLoading } = useMatchHistory({ accountId: player?.account_id ?? 0 });

  const filterMatchIds = matchIds ? JSON.parse(matchIds) : undefined;
  if (filterMatchIds) {
    matchHistory = matchHistory?.filter((match) => filterMatchIds?.includes(match.match_id)) ?? [];
  } else {
    matchHistory = matchHistory?.filter((match) => !minUnixTimestamp || match.start_time >= minUnixTimestamp) ?? [];
  }

  const queryClient = useQueryClient();
  const onRefreshing = useCallback(
    async () => await queryClient.refetchQueries({ queryKey: ["api-match-history", player?.account_id ?? null] }),
    [queryClient, player?.account_id],
  );

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.containerWithHeader}>
      {!filterMatchIds && <TimeRangeSelect />}
      {matchHistory ? (
        <MatchList
          matches={matchHistory}
          scroll
          onRefreshing={onRefreshing}
          onPress={(matchId) => router.navigate(`/(tabs)/matches/${matchId}`)}
        />
      ) : isLoading ? (
        <View style={{ alignItems: "center", justifyContent: "center", padding: 16 }}>
          <ActivityIndicator size="large" />
          <Text tx="matchesListScreen:loadingMatchHistory" />
        </View>
      ) : (
        <View style={{ alignItems: "center", justifyContent: "center", padding: 16 }}>
          <Text tx="matchesListScreen:noMatchesFound" />
        </View>
      )}
    </Screen>
  );
}
