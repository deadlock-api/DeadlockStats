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
            <Text numberOfLines={1} style={themed($timeText)}>
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
          >
            {isMatchWon(match) ? translate("common:victory") : translate("common:defeat")}
          </Text>
          <Text style={themed($timeText)}>{formatMatchDuration(match.match_duration_s)}</Text>
          <Text style={themed($timeText)}>{formatRelativeTime(match.start_time)}</Text>
        </View>
      </View>
      <View style={themed($statsRow)}>
        <View style={themed($statsColumn)}>
          <Text style={themed($statsLabel)}>KDA</Text>
          <Text style={themed($statsValue)}>
            {match.player_kills}/{match.player_deaths}/{match.player_assists}
          </Text>
        </View>
        <View style={themed($statsColumn)}>
          <Text style={themed($statsLabel)}>Last Hits</Text>
          <Text style={themed($statsValue)}>{match.last_hits}</Text>
        </View>
        <View style={themed($statsColumn)}>
          <Text style={themed($statsLabel)}>Denies</Text>
          <Text style={themed($statsValue)}>{match.denies}</Text>
        </View>
        <View style={themed($statsColumn)}>
          <Text style={themed($statsLabel)}>Net Worth</Text>
          <Text style={themed($statsValue)}>{match.net_worth.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const $statsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-evenly",
  width: "100%",
  padding: spacing.xxs,
});

const $statsColumn: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
});

const $statsLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 12,
  lineHeight: 14,
});

const $statsValue: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: 14,
  lineHeight: 16,
  fontFamily: typography.primary.semiBold,
});

const $timeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 12,
  lineHeight: 14,
});

const $matchHero: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
});

const $matchInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginLeft: spacing.md,
});

const $matchStats: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-end",
});

const $matchResult: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 14,
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
  marginBottom: spacing.md,
});
