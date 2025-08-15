import { FlatList, type ViewStyle } from "react-native";
import { MatchItem } from "@/components/matches/MatchItem";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import type { MatchHistory } from "@/services/api/types/match_history";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";

export const MatchList = ({ matches }: { matches: MatchHistory[] }) => {
  const { themed } = useAppTheme();
  return (
    <FlatList
      data={matches}
      maxToRenderPerBatch={20}
      initialNumToRender={10}
      windowSize={10}
      renderItem={({ item }) => <MatchItem match={item} />}
      keyExtractor={(item) => item.match_id.toString()}
      ListEmptyComponent={() => (
        <Card style={themed($noDataView)}>
          <Text style={$styles.textCenter} tx="matchesListScreen:noMatchesFound" />
        </Card>
      )}
      scrollEnabled={false}
    />
  );
};

const $noDataView: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
  marginVertical: spacing.md,
});
