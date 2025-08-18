import { useCallback, useState } from "react";
import { FlatList, RefreshControl, type ViewStyle } from "react-native";
import { MatchItem } from "@/components/matches/MatchItem";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import type { MatchHistory } from "@/services/api/types/match_history";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";

interface MatchListProps {
  matches: MatchHistory[];
  scroll?: boolean;
  onRefreshing?: () => Promise<void>;
}

export const MatchList = ({ matches, scroll, onRefreshing }: MatchListProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const { themed } = useAppTheme();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefreshing?.();
    setRefreshing(false);
  }, [onRefreshing]);

  return (
    <>
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
        refreshControl={onRefreshing && <RefreshControl onRefresh={handleRefresh} refreshing={refreshing} />}
        scrollEnabled={scroll ?? false}
      />
    </>
  );
};

const $noDataView: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
  marginVertical: spacing.md,
});
