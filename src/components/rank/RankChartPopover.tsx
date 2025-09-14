import { FontAwesome6 } from "@expo/vector-icons";
import { useFont } from "@shopify/react-native-skia";
import type { MMRHistory } from "deadlock-api-client";
import { useMemo } from "react";
import { Modal, TouchableOpacity, TouchableWithoutFeedback, View, type ViewStyle } from "react-native";
import { RankImage } from "src/components/rank/RankImage";
import { division, RankName, subrank } from "src/components/rank/RankName";
import { Text } from "src/components/ui/Text";
import { useAssetsRanks } from "src/hooks/useAssetsRanks";
import { translate } from "src/i18n/translate";
import { useAppTheme } from "src/theme/context";
import type { ThemedStyle } from "src/theme/types";
import { CartesianChart, Line } from "victory-native";

interface RankChartPopoverProps {
  visible: boolean;
  onClose: () => void;
  rankData?: MMRHistory[];
}

export function RankChartPopover({ visible, onClose, rankData }: RankChartPopoverProps) {
  const { themed, theme } = useAppTheme();
  const font = useFont(require("@assets/fonts/SpaceGrotesk-Medium.ttf"));
  const { data: ranks } = useAssetsRanks();

  // Filtered chart data based on lookback period
  const chartData = useMemo(
    () =>
      rankData
        ?.map((rd) => ({
          player_score: rd.player_score ?? 0,
          startTime: rd.start_time,
          matchId: rd.match_id,
        }))
        .sort((a, b) => a.matchId - b.matchId),
    [rankData],
  );

  const currentRank = rankData?.[0]?.rank;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={themed($backdrop)}>
          <TouchableWithoutFeedback>
            <View style={themed($popoverContainer)}>
              {/* Header */}
              <View style={themed($header)}>
                <View style={themed($titleContainer)}>
                  {currentRank && (
                    <View style={themed($rankDisplay)}>
                      <RankImage rank={currentRank} size={32} />
                      <Text size="lg" weight="semiBold" style={{ color: theme.colors.text }}>
                        <RankName rank={currentRank} />
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={onClose} style={themed($closeButton)}>
                  <FontAwesome6 name="xmark" size={20} color={theme.colors.textDim} />
                </TouchableOpacity>
              </View>

              {/* Chart */}
              <View style={themed($chartContainer)}>
                {chartData && chartData.length > 0 ? (
                  <CartesianChart
                    data={chartData}
                    xKey="startTime"
                    yKeys={["player_score"]}
                    axisOptions={{
                      font,
                      lineColor: theme.colors.text,
                      labelColor: theme.colors.text,
                      tickCount: {
                        x: 3,
                        y: 5,
                      },
                      formatXLabel: (value) => new Date(value * 1000).toLocaleDateString(),
                      formatYLabel: (player_score: number) => {
                        const rank = Math.max(0, Math.min(66, player_score));
                        const adjustedRank = rank > 0 ? 10 * Math.floor((rank - 1) / 6) + 11 + ((rank - 1) % 6) : 0;
                        const assetsRank = ranks?.find((r) => adjustedRank && r.tier === division(adjustedRank));
                        return `${assetsRank?.name.slice(0, 4)} ${subrank(adjustedRank ?? 1)}`;
                      },
                    }}
                  >
                    {({ points }) => (
                      <Line
                        points={points.player_score}
                        color={theme.colors.tint}
                        strokeWidth={3}
                        curveType="cardinal"
                        connectMissingData
                      />
                    )}
                  </CartesianChart>
                ) : (
                  <View style={themed($emptyState)}>
                    <Text size="md" style={{ color: theme.colors.textDim }}>
                      {translate("rankHistoryScreen:noRankDataAvailable")}
                    </Text>
                  </View>
                )}
              </View>

              {/* Footer info */}
              <View style={themed($footer)}>
                <Text size="xs" style={{ color: theme.colors.textDim, textAlign: "center" }}>
                  {chartData && chartData.length > 0
                    ? `Last ${chartData.length} Matches`
                    : translate("rankHistoryScreen:noRankDataAvailable")}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const $backdrop: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
});

const $popoverContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: spacing.md,
  margin: spacing.lg,
  maxHeight: "70%",
  width: "90%",
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 16,
  elevation: 8,
});

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: spacing.md,
  paddingBottom: spacing.sm,
});

const $titleContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.xs,
});

const $rankDisplay: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
});

const $closeButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
  borderRadius: spacing.xs,
});

const $chartContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  height: 300,
});

const $emptyState: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
});

const $footer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
  paddingTop: spacing.sm,
});
