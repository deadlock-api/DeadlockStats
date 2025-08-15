import { FontAwesome6 } from "@expo/vector-icons";
import type { FC } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { usePlayerSelected, useTimeRangeSelected } from "@/app";
import { MatchList } from "@/components/matches/MatchList";
import { TimeRangeSelect } from "@/components/select/TimeRangeSelect";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useMatchHistory } from "@/hooks/useMatchHistory";
import type { MatchesStackScreenProps } from "@/navigators/MatchesNavigator";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import { hasSteamId } from "@/utils/steamAuth";

export const MatchesListScreen: FC<MatchesStackScreenProps<"List">> = (props) => {
  const { theme } = useAppTheme();

  const [timeRange, _1] = useTimeRangeSelected();
  const [player, _2] = usePlayerSelected();

  const now = Math.floor(Date.now() / 1000);
  const nextFullHour = Math.ceil(now / 3600) * 3600;
  const minUnixTimestamp = timeRange.value ? nextFullHour - timeRange.value : 0;

  let { data: matchHistory, isLoading } = useMatchHistory(player?.account_id ?? null);

  const filterMatchIds = props.route.params?.matchIds;
  if (filterMatchIds) {
    matchHistory = matchHistory?.filter((match) => filterMatchIds?.includes(match.match_id)) ?? [];
  } else {
    matchHistory = matchHistory?.filter((match) => !minUnixTimestamp || match.start_time >= minUnixTimestamp) ?? [];
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$styles.container}>
      {!filterMatchIds && <TimeRangeSelect />}
      {filterMatchIds && (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text text={`Filtered for ${filterMatchIds.length} matches`} />
          <TouchableOpacity onPress={() => props.navigation.navigate("List")}>
            <FontAwesome6 name="circle-xmark" solid color={theme.colors.palette.angry500} size={24} />
          </TouchableOpacity>
        </View>
      )}
      {matchHistory ? (
        <MatchList matches={matchHistory} scroll />
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
