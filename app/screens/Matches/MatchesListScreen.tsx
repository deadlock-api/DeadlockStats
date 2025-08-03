import type { FC } from "react";
import { ActivityIndicator, FlatList, type TextStyle, View } from "react-native";
import { usePlayerSelected, useTimeRangeSelected } from "@/app";
import { MatchItem } from "@/components/matches/MatchItem";
import { AccountSelector } from "@/components/profile/AccountSelector";
import { TimeRangeSelect } from "@/components/select/TimeRangeSelect";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useMatchHistory } from "@/hooks/useMatchHistory";
import type { MatchesStackScreenProps } from "@/navigators/MatchesNavigator";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";

const RENDER_STEP_SIZE = 30;

export const MatchesListScreen: FC<MatchesStackScreenProps<"List">> = (props) => {
  const { themed } = useAppTheme();

  const [timeRange, _1] = useTimeRangeSelected();
  const [player, _2] = usePlayerSelected();

  const now = Math.floor(Date.now() / 1000);
  const nextFullHour = Math.ceil(now / 3600) * 3600;
  const minUnixTimestamp = timeRange.value ? nextFullHour - timeRange.value : null;

  let { data: matchHistory, isLoading } = useMatchHistory(player?.account_id ?? null);

  matchHistory = matchHistory?.filter((match) => !minUnixTimestamp || match.start_time >= minUnixTimestamp) ?? [];

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$styles.container}>
      <AccountSelector />
      <TimeRangeSelect />
      {matchHistory ? (
        <FlatList
          data={matchHistory}
          renderItem={({ item }) => (
            <MatchItem match={item} onPress={() => props.navigation.navigate("Details", { matchId: item.match_id })} />
          )}
          keyExtractor={(item) => item.match_id.toString()}
          ListEmptyComponent={() => <Text style={themed($noDataText)} text="No matches found" />}
          maxToRenderPerBatch={RENDER_STEP_SIZE}
          style={{
            borderRadius: 12,
          }}
        />
      ) : isLoading ? (
        <View style={{ alignItems: "center", justifyContent: "center", padding: 16 }}>
          <ActivityIndicator size="large" />
          <Text>Loading match history...</Text>
        </View>
      ) : (
        <View style={{ alignItems: "center", justifyContent: "center", padding: 16 }}>
          <Text>No matches found</Text>
        </View>
      )}
    </Screen>
  );
};

const $noDataText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 16,
  fontWeight: "bold",
  textAlign: "center",
  padding: 16,
});
