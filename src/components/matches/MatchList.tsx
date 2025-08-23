import { useCallback, useState } from "react";
import { FlatList, RefreshControl, TouchableOpacity, type ViewStyle } from "react-native";
import { Card } from "src/components/ui/Card";
import { Text } from "src/components/ui/Text";
import type { MatchHistory } from "src/services/api/types/match_history";
import { useAppTheme } from "src/theme/context";
import { $styles } from "src/theme/styles";
import type { ThemedStyle } from "src/theme/types";
import { MatchItem } from "./MatchItem";

interface MatchListProps {
  matches: MatchHistory[];
  scroll?: boolean;
  onRefreshing?: () => Promise<void>;
  onPress?: (matchId: number) => void;
}

export const MatchList = ({ matches, scroll, onRefreshing, onPress }: MatchListProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const { themed } = useAppTheme();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefreshing?.();
    setRefreshing(false);
  }, [onRefreshing]);

  return (
    <FlatList
      data={matches}
      maxToRenderPerBatch={10}
      initialNumToRender={10}
      windowSize={20}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onPress?.(item.match_id)}>
          <MatchItem match={item} />
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.match_id.toString()}
      ListEmptyComponent={() => (
        <Card style={themed($noDataView)}>
          <Text style={$styles.textCenter} tx="matchesListScreen:noMatchesFound" />
        </Card>
      )}
      refreshControl={onRefreshing && <RefreshControl onRefresh={handleRefresh} refreshing={refreshing} />}
      scrollEnabled={scroll ?? false}
    />
  );
};

const $noDataView: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
  marginVertical: spacing.md,
});
