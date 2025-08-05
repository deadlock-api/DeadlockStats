import { FontAwesome6 } from "@expo/vector-icons";
import type { FC } from "react";
import { ActivityIndicator, FlatList, type TextStyle, TouchableOpacity, View } from "react-native";
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
import { hasSteamId } from "@/utils/steamAuth";

const RENDER_STEP_SIZE = 30;

export const MatchesListScreen: FC<MatchesStackScreenProps<"List">> = (props) => {
  const { themed, theme } = useAppTheme();

  const [timeRange, _1] = useTimeRangeSelected();
  const [player, _2] = usePlayerSelected();

  const now = Math.floor(Date.now() / 1000);
  const nextFullHour = Math.ceil(now / 3600) * 3600;
  const minUnixTimestamp = timeRange.value ? nextFullHour - timeRange.value : null;

  let { data: matchHistory, isLoading } = useMatchHistory(player?.account_id ?? null);

  const filterMatchIds = props.route.params?.matchIds;
  if (filterMatchIds) {
    matchHistory = matchHistory?.filter((match) => filterMatchIds?.includes(match.match_id)) ?? [];
  } else {
    matchHistory = matchHistory?.filter((match) => !minUnixTimestamp || match.start_time >= minUnixTimestamp) ?? [];
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.container}>
      {!filterMatchIds && (
        <>
          <AccountSelector />
          <TimeRangeSelect />
        </>
      )}
      {filterMatchIds && (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text>Filtered for {filterMatchIds.length} matches</Text>
          <TouchableOpacity onPress={() => props.navigation.navigate("List")}>
            <FontAwesome6 name="circle-xmark" solid color={theme.colors.palette.angry500} size={24} />
          </TouchableOpacity>
        </View>
      )}
      {matchHistory ? (
        <FlatList
          data={matchHistory}
          renderItem={({ item }) => (
            <MatchItem match={item} onPress={() => props.navigation.navigate("Details", { matchId: item.match_id })} />
          )}
          keyExtractor={(item) => item.match_id.toString()}
          ListEmptyComponent={() => (
            <Text
              style={themed($noDataText)}
              tx={!hasSteamId() ? "matchesListScreen:noSteamAccountLinked" : "matchesListScreen:noMatchesFound"}
            />
          )}
          maxToRenderPerBatch={RENDER_STEP_SIZE}
          style={{
            borderRadius: 12,
          }}
        />
      ) : isLoading ? (
        <View style={{ alignItems: "center", justifyContent: "center", padding: 16 }}>
          <ActivityIndicator size="large" />
          <Text tx="matchesListScreen:loadingMatchHistory" />
        </View>
      ) : (
        <View style={{ alignItems: "center", justifyContent: "center", padding: 16 }}>
          <Text tx={!hasSteamId() ? "matchesListScreen:noSteamAccountLinked" : "matchesListScreen:noMatchesFound"} />
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
