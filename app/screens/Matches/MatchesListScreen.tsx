import type { FC } from "react";
import { FlatList, type TextStyle, type ViewStyle } from "react-native";
import { usePlayerSelected } from "@/app";
import { MatchItem } from "@/components/matches/MatchItem";
import { AccountSelector } from "@/components/profile/AccountSelector";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useMatchHistory } from "@/hooks/useMatchHistory";
import type { MatchesStackScreenProps } from "@/navigators/MatchesNavigator";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";

const RENDER_STEP_SIZE = 30;

export const MatchesListScreen: FC<MatchesStackScreenProps<"List">> = (props) => {
  const { themed, theme } = useAppTheme();

  const [player, _] = usePlayerSelected();

  const { data: matchHistory, isLoading } = useMatchHistory(player?.account_id ?? null);

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$styles.container}>
      <AccountSelector />
      {matchHistory ? (
        <FlatList
          data={matchHistory}
          renderItem={({ item, index }) => (
            <MatchItem
              match={item}
              noBorder={index === matchHistory.length - 1}
              onPress={() => props.navigation.navigate("Details", { matchId: item.match_id })}
            />
          )}
          keyExtractor={(item) => item.match_id.toString()}
          ListEmptyComponent={() => <Text style={themed($noDataText)} text="No matches found" />}
          maxToRenderPerBatch={RENDER_STEP_SIZE}
          style={{
            backgroundColor: theme.colors.palette.neutral100,
            borderRadius: 12,
          }}
        />
      ) : isLoading ? (
        <Text text="Loading match history..." />
      ) : (
        <Text text="Failed to load match history" />
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
