import React from "react";
import { type TextStyle, View, type ViewStyle } from "react-native";
import { Text } from "@/components/ui/Text";
import type { MatchHistory } from "@/services/api/types/match_history";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import { formatMatchDuration, formatRelativeTime, isMatchWon } from "@/utils/matchHistoryStats";
import { HeroImage } from "../heroes/HeroImage";

export interface MatchHistoryEntryProps {
  /**
   * The match history data to display
   */
  match: MatchHistory;
}

/**
 * Individual match history entry component that displays match details
 */
export const MatchHistoryEntry = React.memo<MatchHistoryEntryProps>((props) => {
  const { match } = props;
  const { themed, theme } = useAppTheme();

  const won = isMatchWon(match);
  const duration = formatMatchDuration(match.match_duration_s);
  const timeAgo = formatRelativeTime(match.start_time);

  function addAlpha(color: string, opacity: number) {
    // biome-ignore lint/style/noNonNullAssertion: Safe to ignore
    //  color is a hex
    const [r, g, b] = color.match(/\w\w/g)!.map((x) => parseInt(x, 16));
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return (
    <View style={themed($cardContainer)}>
      <View
        style={[
          themed($cardContent),
          { backgroundColor: addAlpha(won ? theme.colors.palette.success300 : theme.colors.palette.failure300, 0.4) },
        ]}
      >
        {/* Main Content */}
        <View style={themed($contentContainer)}>
          <View style={themed($topBarContainer)}>
            <View style={themed($resultContainer)}>
              <HeroImage hero_id={match.hero_id} size={40} />
              <Text
                text={won ? "WIN" : "LOSS"}
                style={[
                  themed($resultText),
                  { color: won ? theme.colors.palette.success500 : theme.colors.palette.failure500 },
                ]}
              />
            </View>
            <Text text={`${duration} | ${timeAgo}`} preset="formHelper" style={themed($timeText)} />
          </View>
          <View style={themed($statsRow)}>
            <View style={themed($statItem)}>
              <Text text="KDA" preset="formLabel" style={themed($statLabel)} />
              <View style={themed($kdaRow)}>
                <Text
                  text={match.player_kills.toString()}
                  style={[themed($statValue), { color: theme.colors.palette.success600 }]}
                />
                <Text text=" / " style={themed($statValue)} />
                <Text
                  text={match.player_deaths.toString()}
                  style={[themed($statValue), { color: theme.colors.palette.failure600 }]}
                />
                <Text text=" / " style={themed($statValue)} />
                <Text text={match.player_assists.toString()} style={themed($statValue)} />
              </View>
            </View>

            <View style={themed($statItem)}>
              <Text text="Net Worth" preset="formLabel" style={themed($statLabel)} />
              <Text text={match.net_worth.toLocaleString()} style={themed($statValue)} />
            </View>

            <View style={themed($statItem)}>
              <Text text="Last Hits" preset="formLabel" style={themed($statLabel)} />
              <Text text={match.last_hits.toLocaleString()} style={themed($statValue)} />
            </View>
          </View>
        </View>

        {/* Stats Row */}
      </View>
    </View>
  );
});

const $cardContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginHorizontal: spacing.md,
  marginVertical: spacing.sm,
});

const $cardContent: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  padding: spacing.md,
  flexDirection: "row",
  alignItems: "stretch",
  borderRadius: 12,
  backgroundColor: colors.background,
});

const $contentContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $topBarContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.sm,
});

const $resultContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  // paddingVertical: spacing.lg,
  gap: spacing.xxs,
});

const $resultText: ThemedStyle<TextStyle> = () => ({
  fontSize: 16,
  fontWeight: "bold",
});

const $statsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.sm,
  gap: spacing.xxs,
});

const $statItem: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  padding: 6,
});

const $kdaRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.sm,
});

const $statLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 14,
});

const $statValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  fontWeight: "bold",
});

const $timeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 10,
  lineHeight: 12,
});
