import type { PlayerMatchHistoryEntry } from "deadlock-api-client";
import { type TextStyle, View, type ViewStyle } from "react-native";
import { HeroImage } from "src/components/heroes/HeroImage";
import { HeroName } from "src/components/heroes/HeroName";
import { Card } from "src/components/ui/Card";
import { Text } from "src/components/ui/Text";
import { translate } from "src/i18n/translate";
import { useAppTheme } from "src/theme/context";
import type { ThemedStyle } from "src/theme/types";
import { formatMatchDuration, formatRelativeTime, isMatchWon, parseMatchMode } from "src/utils/matchHistoryStats";
import { StatItem } from "./StatItem";

export const MatchItem = ({ match }: { match: PlayerMatchHistoryEntry }) => {
  const { themed, theme } = useAppTheme();
  return (
    <Card style={themed($matchItem)}>
      <View style={themed($headerRow)}>
        <View style={themed($matchHero)}>
          <HeroImage heroId={match.hero_id} size={40} />
          <View style={themed($matchInfo)}>
            <Text numberOfLines={1} style={{ fontFamily: theme.typography.primary.semiBold }}>
              <HeroName heroId={match.hero_id} />
            </Text>
            <Text numberOfLines={1} style={themed($timeText)} size="xxs">
              {match.match_id}
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
        <StatItem label="KDA" value={`${match.player_kills}/${match.player_deaths}/${match.player_assists}`} />
        <StatItem label="Last Hits" value={`${match.last_hits}`} />
        <StatItem label="Denies" value={`${match.denies}`} />
        <StatItem label="Level" value={`${match.hero_level}`} />
        <StatItem label="Net Worth" value={`${(match.net_worth / 1000).toFixed(0).toLocaleString()}k`} />
      </View>
    </Card>
  );
};

const $matchItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "column",
  alignItems: "center",
  marginVertical: spacing.xxs,
  borderRadius: 12,
});

const $statsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
  paddingBottom: spacing.xxs,
  gap: spacing.xs,
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

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.sm,
});
