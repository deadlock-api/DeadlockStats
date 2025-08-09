import { type TextStyle, TouchableOpacity, View, type ViewStyle } from "react-native";
import { HeroImage } from "@/components/heroes/HeroImage";
import { HeroName } from "@/components/heroes/HeroName";
import { Text } from "@/components/ui/Text";
import { translate } from "@/i18n/translate";
import type { MatchHistory } from "@/services/api/types/match_history";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import { formatMatchDuration, formatRelativeTime, isMatchWon, parseMatchMode } from "@/utils/matchHistoryStats";

export const MatchItem = ({ match, onPress }: { match: MatchHistory; onPress: (match: MatchHistory) => void }) => {
  const { themed, theme } = useAppTheme();
  return (
    <TouchableOpacity onPress={() => onPress(match)} style={themed($matchItem)}>
      <View style={themed($headerRow)}>
        <View style={themed($matchHero)}>
          <HeroImage heroId={match.hero_id} size={40} />
          <View style={themed($matchInfo)}>
            <Text numberOfLines={1} style={{ fontFamily: theme.typography.primary.semiBold }}>
              <HeroName heroId={match.hero_id} />
            </Text>
            <Text numberOfLines={1} style={themed($timeText)} size="xxs">
              {parseMatchMode(match.match_mode)}
            </Text>
          </View>
        </View>
        <View style={themed($matchStats)}>
          <Text
            style={[
              themed($matchResult),
              { color: isMatchWon(match) ? theme.colors.palette.success500 : theme.colors.palette.failure500 },
            ]}
            size="sm"
          >
            {isMatchWon(match) ? translate("common:victory") : translate("common:defeat")}
          </Text>
          <Text style={themed($timeText)} size="xxs">
            {formatMatchDuration(match.match_duration_s)}
          </Text>
          <Text style={themed($timeText)} size="xxs">
            {formatRelativeTime(match.start_time)}
          </Text>
        </View>
      </View>
      <View style={themed($statsRow)}>
        <View style={themed($statsColumn)}>
          <Text style={themed($statsLabel)} size="xxs">
            KDA
          </Text>
          <Text style={themed($statsValue)} size="xs">
            {match.player_kills}/{match.player_deaths}/{match.player_assists}
          </Text>
        </View>
        <View style={themed($statsColumn)}>
          <Text style={themed($statsLabel)} size="xxs">
            Last Hits
          </Text>
          <Text style={themed($statsValue)} size="xs">
            {match.last_hits}
          </Text>
        </View>
        <View style={themed($statsColumn)}>
          <Text style={themed($statsLabel)} size="xxs">
            Denies
          </Text>
          <Text style={themed($statsValue)} size="xs">
            {match.denies}
          </Text>
        </View>
        <View style={themed($statsColumn)}>
          <Text style={themed($statsLabel)} size="xxs">
            Level
          </Text>
          <Text style={themed($statsValue)} size="xs">
            {match.hero_level}
          </Text>
        </View>
        <View style={themed($statsColumn)}>
          <Text style={themed($statsLabel)} size="xxs">
            Net Worth
          </Text>
          <Text style={themed($statsValue)} size="xs">
            {(match.net_worth / 1000).toFixed(0).toLocaleString()}k
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const $statsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
  paddingBottom: spacing.xxs,
});

const $statsColumn: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
});

const $statsLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});

const $statsValue: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.semiBold,
});

const $timeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});

const $matchHero: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
});

const $matchInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginLeft: spacing.sm,
});

const $matchStats: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-end",
});

const $matchResult: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.bold,
});

const $matchItem: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  marginVertical: spacing.xxs,
  borderRadius: 12,
  padding: spacing.sm,
  elevation: 1,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
});

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.sm,
});
